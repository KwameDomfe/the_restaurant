import requests

def test_meal_periods():
    r = requests.get('http://localhost:8000/api/menu-items/meal-periods/')
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
