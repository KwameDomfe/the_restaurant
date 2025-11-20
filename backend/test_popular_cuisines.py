import requests

r = requests.get('http://localhost:8000/api/restaurants/popular-cuisines/')
data = r.json()

print(f'✅ Popular Cuisines: {len(data)}')
print()

for cuisine in data:
    print(f'{cuisine["emoji"]} {cuisine["name"]}')
    print(f'   Restaurants: {cuisine["restaurant_count"]}')
    print(f'   Avg Rating: {cuisine["avg_rating"]}')
    print()
