from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Follow, Post, Like, Comment, DiningGroup, GroupMembership, Favorite
from .serializers import PostSerializer, CommentSerializer, DiningGroupSerializer, FollowSerializer

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post_type', 'restaurant', 'user']
    ordering = ['-created_at']

    def get_queryset(self):
        return Post.objects.filter(is_public=True).select_related('user', 'restaurant', 'menu_item')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post', 'delete'])
    def like(self, request, pk=None):
        """Like or unlike a post"""
        post = self.get_object()
        user = request.user

        if request.method == 'POST':
            like, created = Like.objects.get_or_create(user=user, post=post)
            if created:
                return Response({'message': 'Post liked'})
            return Response({'message': 'Already liked'}, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            try:
                like = Like.objects.get(user=user, post=post)
                like.delete()
                return Response({'message': 'Post unliked'})
            except Like.DoesNotExist:
                return Response({'message': 'Not liked'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        """Get or create comments for a post"""
        post = self.get_object()
        
        if request.method == 'GET':
            comments = post.comments.filter(parent=None).select_related('user')
            serializer = CommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = CommentSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(user=request.user, post=post)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def feed(self, request):
        """Get personalized feed based on followed users"""
        user = request.user
        following_users = user.following.values_list('following', flat=True)
        
        # Include posts from followed users and own posts
        queryset = self.get_queryset().filter(
            user__in=list(following_users) + [user.id]
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class DiningGroupViewSet(viewsets.ModelViewSet):
    serializer_class = DiningGroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurant', 'is_public', 'is_active']
    ordering = ['-created_at']

    def get_queryset(self):
        return DiningGroup.objects.filter(is_active=True).select_related('creator', 'restaurant')

    def perform_create(self, serializer):
        group = serializer.save(creator=self.request.user)
        # Add creator as member
        GroupMembership.objects.create(
            user=self.request.user,
            group=group,
            role='creator'
        )

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a dining group"""
        group = self.get_object()
        user = request.user
        
        if group.members.count() >= group.max_members:
            return Response(
                {'error': 'Group is full'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        membership, created = GroupMembership.objects.get_or_create(
            user=user,
            group=group,
            defaults={'role': 'member'}
        )
        
        if created:
            return Response({'message': 'Joined group successfully'})
        return Response(
            {'message': 'Already a member'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a dining group"""
        group = self.get_object()
        user = request.user
        
        try:
            membership = GroupMembership.objects.get(user=user, group=group)
            if membership.role == 'creator':
                return Response(
                    {'error': 'Creator cannot leave group'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            membership.delete()
            return Response({'message': 'Left group successfully'})
        except GroupMembership.DoesNotExist:
            return Response(
                {'message': 'Not a member'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class FollowViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def follow_user(self, request):
        """Follow a user"""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user_to_follow = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if user_to_follow == request.user:
            return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=user_to_follow
        )
        
        if created:
            return Response({'message': 'User followed successfully'})
        return Response({'message': 'Already following'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def unfollow_user(self, request):
        """Unfollow a user"""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            follow = Follow.objects.get(
                follower=request.user,
                following_id=user_id
            )
            follow.delete()
            return Response({'message': 'User unfollowed successfully'})
        except Follow.DoesNotExist:
            return Response({'message': 'Not following this user'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def followers(self, request):
        """Get user's followers"""
        followers = Follow.objects.filter(following=request.user).select_related('follower')
        serializer = FollowSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def following(self, request):
        """Get users that current user is following"""
        following = Follow.objects.filter(follower=request.user).select_related('following')
        serializer = FollowSerializer(following, many=True)
        return Response(serializer.data)
