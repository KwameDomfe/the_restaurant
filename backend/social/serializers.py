from rest_framework import serializers
from .models import Follow, Post, Like, Comment, DiningGroup, GroupMembership, Favorite
from accounts.serializers import PublicUserSerializer
from restaurants.serializers import RestaurantListSerializer, MenuItemSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class PostSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    restaurant = RestaurantListSerializer(read_only=True)
    menu_item = MenuItemSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'restaurant', 'menu_item', 'post_type', 'content',
            'images', 'rating', 'location_data', 'tags', 'is_public',
            'likes_count', 'comments_count', 'is_liked', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'content', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_replies(self, obj):
        if obj.parent is None:
            replies = obj.replies.all()[:5]  # Limit replies
            return CommentSerializer(replies, many=True, context=self.context).data
        return []

class DiningGroupSerializer(serializers.ModelSerializer):
    creator = PublicUserSerializer(read_only=True)
    restaurant = RestaurantListSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = DiningGroup
        fields = [
            'id', 'name', 'description', 'creator', 'restaurant',
            'planned_date', 'max_members', 'members_count', 'is_public',
            'is_active', 'is_member', 'created_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at']

    def get_members_count(self, obj):
        return obj.members.count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

class FollowSerializer(serializers.ModelSerializer):
    follower = PublicUserSerializer(read_only=True)
    following = PublicUserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['id', 'follower', 'created_at']