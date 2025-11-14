from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from restaurants.models import Restaurant

@csrf_exempt
def test_api(request):
    try:
        restaurants = Restaurant.objects.all()
        data = []
        for restaurant in restaurants:
            data.append({
                'id': restaurant.id,
                'name': restaurant.name,
                'cuisine_type': restaurant.cuisine_type,
                'rating': str(restaurant.rating)
            })
        
        return JsonResponse({
            'status': 'success',
            'count': len(data),
            'restaurants': data
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e)
        }, status=500)