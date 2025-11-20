import requests
import json

r = requests.get('http://localhost:8000/api/restaurants/menu-items/by_meal_period/')
data = r.json()

print(f'✅ Meal periods available: {len(data)}')
print()

for period in data:
    print(f'{period["emoji"]} {period["name"]} ({period["time"]})')
    print(f'   Items: {len(period["items"])}')
    print()
