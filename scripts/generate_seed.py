from decimal import Decimal
from textwrap import indent
import uuid
import json

# Helper to format SQL values

def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"

def sql_array(values):
    if values is None:
        return "NULL"
    inner = ",".join("'" + v.replace("'", "''") + "'" for v in values)
    return f"ARRAY[{inner}]"


def decimal_str(d: Decimal) -> str:
    return f"{d:.2f}"

menu_categories = [
    {
        "category_id": "18a1f5d0-1fda-4f40-9c4a-7c2fa8e3b410",
        "name": "Small Plates",
        "description": "Shareable starters inspired by Clay Pit classics",
        "display_order": 1,
        "is_active": True,
    },
    {
        "category_id": "2b6c8e73-1c16-4f5d-8ac4-3d64f40ec432",
        "name": "Curries & Biryanis",
        "description": "Signature curries and fragrant biryanis",
        "display_order": 2,
        "is_active": True,
    },
    {
        "category_id": "3c9d1b86-8e32-4ae6-9a0c-4a9ce7215d5b",
        "name": "Clay Pit Specialties",
        "description": "Chef-driven specials and tandoor selections",
        "display_order": 3,
        "is_active": True,
    },
    {
        "category_id": "4ddf2c97-5f47-4f77-96c4-0b2f4dbe6e21",
        "name": "Sides & Breads",
        "description": "Tandoor-baked breads and accompaniments",
        "display_order": 4,
        "is_active": True,
    },
    {
        "category_id": "5ee13da8-6a58-41a9-8ad8-2c3f5eca7f33",
        "name": "Desserts",
        "description": "House-made desserts",
        "display_order": 5,
        "is_active": True,
    },
    {
        "category_id": "6ff24eb9-7b69-4cba-9be4-3d4f6fdb8a45",
        "name": "Signature Cocktails",
        "description": "House-infused cocktails and libations",
        "display_order": 6,
        "is_active": True,
    },
]

menu_items = [
    {
        "menu_item_id": "71a3ad60-45a4-4d2c-9e81-1f9ecbd6123e",
        "category_id": "18a1f5d0-1fda-4f40-9c4a-7c2fa8e3b410",
        "name": "Cucumber Salad",
        "description": "Arugula, tamarind dressing, truffle oil",
        "is_vegetarian": True,
        "is_vegan": True,
        "is_gluten_free": True,
        "spice_level": "mild",
        "base_price": Decimal("7.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 8,
    },
    {
        "menu_item_id": "82b4be71-56b5-4e3d-ad92-2a0fdece234f",
        "category_id": "18a1f5d0-1fda-4f40-9c4a-7c2fa8e3b410",
        "name": "Vegetable Samosas",
        "description": "Potato & pea pastry with mint chutney",
        "is_vegetarian": True,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "medium",
        "base_price": Decimal("8.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 10,
    },
    {
        "menu_item_id": "93c5cf82-67c6-4f4e-be03-3b1eefdf3450",
        "category_id": "18a1f5d0-1fda-4f40-9c4a-7c2fa8e3b410",
        "name": "Chicken Pakoras",
        "description": "Chickpea battered chicken fritters",
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "medium",
        "base_price": Decimal("8.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 9,
    },
    {
        "menu_item_id": "a4d6e093-78d7-4a5f-af14-4c2ff0e04651",
        "category_id": "18a1f5d0-1fda-4f40-9c4a-7c2fa8e3b410",
        "name": "Crispy Cauliflower",
        "description": "Flash-fried cauliflower with curried hummus",
        "is_vegetarian": True,
        "is_vegan": True,
        "is_gluten_free": False,
        "spice_level": "medium",
        "base_price": Decimal("10.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 9,
    },
    {
        "menu_item_id": "b5e7f1a4-89e8-4b6f-bf25-5d30f1f15762",
        "category_id": "18a1f5d0-1fda-4f40-9c4a-7c2fa8e3b410",
        "name": "Tandoori Broccoli",
        "description": "Marinated grilled broccoli with tikka masala sauce",
        "is_vegetarian": True,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "medium",
        "base_price": Decimal("8.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 11,
    },
    {
        "menu_item_id": "c6f801b5-9af9-4c70-c036-6e41f2f26873",
        "category_id": "2b6c8e73-1c16-4f5d-8ac4-3d64f40ec432",
        "name": "Tikka Masala",
        "description": "Tomato and butter cream sauce, choice of protein",
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "medium",
        "base_price": Decimal("18.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 18,
    },
    {
        "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984",
        "category_id": "2b6c8e73-1c16-4f5d-8ac4-3d64f40ec432",
        "name": "Goat Biryani",
        "description": "Stir-fried rice with spices and bone-in goat",
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "hot",
        "base_price": Decimal("21.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 24,
    },
    {
        "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95",
        "category_id": "2b6c8e73-1c16-4f5d-8ac4-3d64f40ec432",
        "name": "Coconut Curry",
        "description": "Coconut milk curry with roasted spices",
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "medium",
        "base_price": Decimal("18.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 17,
    },
    {
        "menu_item_id": "f92b34e8-cd2c-4fa3-e369-91641d215ba6",
        "category_id": "2b6c8e73-1c16-4f5d-8ac4-3d64f40ec432",
        "name": "Vindaloo",
        "description": "Paprika and tamarind curry with potatoes",
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "hot",
        "base_price": Decimal("18.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 19,
    },
    {
        "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7",
        "category_id": "2b6c8e73-1c16-4f5d-8ac4-3d64f40ec432",
        "name": "Jeera Saag",
        "description": "Chopped spinach with roasted cumin",
        "is_vegetarian": True,
        "is_vegan": True,
        "is_gluten_free": True,
        "spice_level": "mild",
        "base_price": Decimal("18.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 16,
    },
    {
        "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8",
        "category_id": "3c9d1b86-8e32-4ae6-9a0c-4a9ce7215d5b",
        "name": "Butter Chicken",
        "description": "Tomato butter sauce with bell peppers and onions",
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "medium",
        "base_price": Decimal("19.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 18,
    },
    {
        "menu_item_id": "2c5e671b-108f-4236-96ac-c4964f049ed9",
        "category_id": "3c9d1b86-8e32-4ae6-9a0c-4a9ce7215d5b",
        "name": "Kothmir Salmon",
        "description": "Goan yellow curry sauce with arugula salad",
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": True,
        "spice_level": "mild",
        "base_price": Decimal("22.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 20,
    },
    {
        "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea",
        "category_id": "4ddf2c97-5f47-4f77-96c4-0b2f4dbe6e21",
        "name": "Garlic & Basil Naan",
        "description": "Tandoor-baked naan with garlic and basil",
        "is_vegetarian": True,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "none",
        "base_price": Decimal("4.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 5,
    },
    {
        "menu_item_id": "4e70893d-32a1-4458-98ce-e6b86f25b7fb",
        "category_id": "4ddf2c97-5f47-4f77-96c4-0b2f4dbe6e21",
        "name": "Plain Naan",
        "description": "Fresh bread baked in the tandoor",
        "is_vegetarian": True,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "none",
        "base_price": Decimal("4.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 5,
    },
    {
        "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c",
        "category_id": "5ee13da8-6a58-41a9-8ad8-2c3f5eca7f33",
        "name": "Vegan Chocolate Cake",
        "description": "Vegan chocolate cake with raspberry sauce",
        "is_vegetarian": True,
        "is_vegan": True,
        "is_gluten_free": False,
        "spice_level": "none",
        "base_price": Decimal("8.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 7,
    },
    {
        "menu_item_id": "60a2ab5f-54c3-467a-b510-082a80f44a1d",
        "category_id": "5ee13da8-6a58-41a9-8ad8-2c3f5eca7f33",
        "name": "Gulab Jamun",
        "description": "Milk pastries with vanilla ice cream and rose",
        "is_vegetarian": True,
        "is_vegan": False,
        "is_gluten_free": False,
        "spice_level": "none",
        "base_price": Decimal("8.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 6,
    },
    {
        "menu_item_id": "71b3bc60-65d4-478b-b621-193b91c55b2e",
        "category_id": "6ff24eb9-7b69-4cba-9be4-3d4f6fdb8a45",
        "name": "Peacock Cocktail",
        "description": "Four-layer rum cocktail with mango and pineapple",
        "is_vegetarian": True,
        "is_vegan": True,
        "is_gluten_free": True,
        "spice_level": "none",
        "base_price": Decimal("14.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 4,
    },
    {
        "menu_item_id": "82c4cd71-76e5-489c-c732-2a4ba1d66c3f",
        "category_id": "6ff24eb9-7b69-4cba-9be4-3d4f6fdb8a45",
        "name": "Chakra Martini",
        "description": "House infused vodka, lime, coconut water",
        "is_vegetarian": True,
        "is_vegan": True,
        "is_gluten_free": True,
        "spice_level": "none",
        "base_price": Decimal("12.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 4,
    },
    {
        "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40",
        "category_id": "6ff24eb9-7b69-4cba-9be4-3d4f6fdb8a45",
        "name": "Mango Margarita",
        "description": "El Jimador reposado tequila with mango",
        "is_vegetarian": True,
        "is_vegan": True,
        "is_gluten_free": True,
        "spice_level": "none",
        "base_price": Decimal("10.00"),
        "is_active": True,
        "image_url": None,
        "prep_time_minutes": 4,
    },
]

agent_personas = [
    {
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "name": "Concierge Riya",
        "description": "High-touch concierge specializing in tasting menus",
        "tone_guidelines": {"voice": "warm", "energy": "medium", "style": "concierge"},
        "suggestion_rules": {"upsell": ["signature_cocktails"], "pairings": ["seafood", "dessert"]},
        "default_channel": "voice",
    },
    {
        "agent_persona_id": "41b2d73a-7b4b-4cd4-9ef4-a4b5c37a2d21",
        "name": "Spice Sherpa Dev",
        "description": "Guides spice-forward guests to bold dishes",
        "tone_guidelines": {"voice": "confident", "energy": "high", "style": "culinary_expert"},
        "suggestion_rules": {"highlight": ["vindaloo", "goat_biryani"], "check_allergies": True},
        "default_channel": "voice",
    },
    {
        "agent_persona_id": "51c3e84b-8c5c-4de5-af05-b5c6d48b3e32",
        "name": "Celebration Host Leena",
        "description": "Designs celebratory group dining and private events",
        "tone_guidelines": {"voice": "festive", "energy": "high", "style": "event_planner"},
        "suggestion_rules": {"upsell": ["family-style", "dessert_trays"], "notes": "Confirm headcount and AV needs"},
        "default_channel": "voice",
    },
]

customers = [
    {
        "customer_id": "a1f1b3b2-0c85-4a4a-b311-1a3c97c3d0a1",
        "full_name": "Asha Patel",
        "email": "asha.patel@example.com",
        "phone": "+15125551201",
        "gender": "female",
        "date_of_birth": "1986-03-12",
        "preferred_contact_channel": "sms",
    },
    {
        "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea",
        "full_name": "Jason Nguyen",
        "email": "jason.nguyen@lonestar.io",
        "phone": "+15125551245",
        "gender": "male",
        "date_of_birth": "1984-11-02",
        "preferred_contact_channel": "phone",
    },
    {
        "customer_id": "c35b2a16-4c4a-4e67-bd65-40d7d3c4f4b1",
        "full_name": "Priya Desai",
        "email": "priya.desai@uxcollective.com",
        "phone": "+15125551277",
        "gender": "female",
        "date_of_birth": "1990-07-18",
        "preferred_contact_channel": "email",
    },
    {
        "customer_id": "d48afc90-9a41-4bd7-aa25-f6053dcd5fcb",
        "full_name": "Miguel Hernandez",
        "email": "miguel.hernandez@atxventures.com",
        "phone": "+15125551308",
        "gender": "male",
        "date_of_birth": "1981-02-09",
        "preferred_contact_channel": "phone",
    },
    {
        "customer_id": "e5fcb870-44a4-49f9-9c0e-28b7c3f7d40b",
        "full_name": "Lauren Mitchell",
        "email": "lauren.mitchell@greenthreads.co",
        "phone": "+15125551366",
        "gender": "female",
        "date_of_birth": "1993-05-24",
        "preferred_contact_channel": "sms",
    },
    {
        "customer_id": "f6d9a980-1b44-43d1-bf66-0f905c3b79b0",
        "full_name": "Naveen Iyer",
        "email": "naveen.iyer@quantia.ai",
        "phone": "+15125551421",
        "gender": "male",
        "date_of_birth": "1987-09-03",
        "preferred_contact_channel": "whatsapp",
    },
    {
        "customer_id": "a7c2bb11-7d35-4dea-92f1-5c23bba76e0d",
        "full_name": "Sarah Cho",
        "email": "sarah.cho@storycraft.io",
        "phone": "+15125551488",
        "gender": "female",
        "date_of_birth": "1991-12-15",
        "preferred_contact_channel": "email",
    },
    {
        "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e",
        "full_name": "Rahul Kapur",
        "email": "rahul.kapur@kapurlegal.com",
        "phone": "+15125551542",
        "gender": "male",
        "date_of_birth": "1979-08-27",
        "preferred_contact_channel": "phone",
    },
    {
        "customer_id": "c9d4dd33-0a77-4ef8-9509-e1a1e8c7f901",
        "full_name": "Emily Ross",
        "email": "emily.ross@modmark.co",
        "phone": "+15125551598",
        "gender": "female",
        "date_of_birth": "1992-04-07",
        "preferred_contact_channel": "sms",
    },
    {
        "customer_id": "da0eaa44-1b88-4ff9-a51a-f2b2f9d80902",
        "full_name": "Daniel Kim",
        "email": "daniel.kim@atxcreative.io",
        "phone": "+15125551632",
        "gender": "male",
        "date_of_birth": "1988-10-19",
        "preferred_contact_channel": "email",
    },
    {
        "customer_id": "eb1fbb55-2c99-5000-b52b-03c30ae90a03",
        "full_name": "Maya Lopez",
        "email": "maya.lopez@wellnesswave.org",
        "phone": "+15125551704",
        "gender": "female",
        "date_of_birth": "1995-01-31",
        "preferred_contact_channel": "phone",
    },
    {
        "customer_id": "fc20cc66-3daa-5111-c63c-14d41bf91b04",
        "full_name": "Chris Carter",
        "email": "chris.carter@hillsideresearch.com",
        "phone": "+15125551768",
        "gender": "male",
        "date_of_birth": "1983-07-22",
        "preferred_contact_channel": "sms",
    },
]

customer_addresses = [
    {
        "address_id": "861a31f1-0f01-4f9b-9af8-1b3d7de6a5e0",
        "customer_id": "a1f1b3b2-0c85-4a4a-b311-1a3c97c3d0a1",
        "label": "Home",
        "street": "1105 San Antonio St Unit 3",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78701",
        "country": "US",
        "latitude": Decimal("30.273800"),
        "longitude": Decimal("-97.742900"),
        "is_default": True,
    },
    {
        "address_id": "972a42e2-1e02-4aab-8b78-2c4e8ef7b6f1",
        "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea",
        "label": "Loft",
        "street": "301 Brazos St Apt 1902",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78701",
        "country": "US",
        "latitude": Decimal("30.265200"),
        "longitude": Decimal("-97.742000"),
        "is_default": True,
    },
    {
        "address_id": "a83b53f3-2f13-4bbc-9c89-3d5f9ff8c702",
        "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea",
        "label": "Office",
        "street": "600 Congress Ave Suite 1900",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78701",
        "country": "US",
        "latitude": Decimal("30.268300"),
        "longitude": Decimal("-97.742800"),
        "is_default": False,
    },
    {
        "address_id": "b94c6404-3024-4ccd-ad9a-4e6fa008d813",
        "customer_id": "c35b2a16-4c4a-4e67-bd65-40d7d3c4f4b1",
        "label": "Townhome",
        "street": "908 West Ave Unit B",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78701",
        "country": "US",
        "latitude": Decimal("30.271100"),
        "longitude": Decimal("-97.745800"),
        "is_default": True,
    },
    {
        "address_id": "ca5d7515-4135-4dde-beab-5f70b119e924",
        "customer_id": "d48afc90-9a41-4bd7-aa25-f6053dcd5fcb",
        "label": "Zilker Home",
        "street": "1501 Barton Springs Rd Unit 520",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78704",
        "country": "US",
        "latitude": Decimal("30.263500"),
        "longitude": Decimal("-97.760200"),
        "is_default": True,
    },
    {
        "address_id": "db6e8626-5246-4eef-bfbc-6071c22af035",
        "customer_id": "e5fcb870-44a4-49f9-9c0e-28b7c3f7d40b",
        "label": "Clarksville",
        "street": "605 W Lynn St Apt 7",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78703",
        "country": "US",
        "latitude": Decimal("30.274900"),
        "longitude": Decimal("-97.758100"),
        "is_default": True,
    },
    {
        "address_id": "ec7f9737-6357-4000-b0cd-7182d33b0046",
        "customer_id": "f6d9a980-1b44-43d1-bf66-0f905c3b79b0",
        "label": "Domain Flat",
        "street": "12100 Domain Dr Apt 904",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78758",
        "country": "US",
        "latitude": Decimal("30.403400"),
        "longitude": Decimal("-97.726300"),
        "is_default": True,
    },
    {
        "address_id": "fd80a848-7468-4111-b1de-8293e44c1157",
        "customer_id": "a7c2bb11-7d35-4dea-92f1-5c23bba76e0d",
        "label": "Downtown Condo",
        "street": "710 Colorado St Unit 909",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78701",
        "country": "US",
        "latitude": Decimal("30.269900"),
        "longitude": Decimal("-97.741300"),
        "is_default": True,
    },
    {
        "address_id": "0e91b959-8579-4222-b2ef-93a4f55d2268",
        "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e",
        "label": "Steiner Ranch",
        "street": "12625 Appaloosa Chase Dr",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78732",
        "country": "US",
        "latitude": Decimal("30.354200"),
        "longitude": Decimal("-97.893200"),
        "is_default": True,
    },
    {
        "address_id": "1f2e3d4c-0b1a-45c6-bf10-0151a2b3c4d5",
        "customer_id": "c9d4dd33-0a77-4ef8-9509-e1a1e8c7f901",
        "label": "Mueller Condo",
        "street": "1910 Simond Ave Unit 306",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78723",
        "country": "US",
        "latitude": Decimal("30.296500"),
        "longitude": Decimal("-97.703400"),
        "is_default": True,
    },
    {
        "address_id": "2f3e4d5c-1c2b-46d7-cf21-1262b3c4d5e6",
        "customer_id": "da0eaa44-1b88-4ff9-a51a-f2b2f9d80902",
        "label": "East Side Loft",
        "street": "1601 E 5th St Apt 210",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78702",
        "country": "US",
        "latitude": Decimal("30.261700"),
        "longitude": Decimal("-97.723900"),
        "is_default": True,
    },
    {
        "address_id": "3f4e5d6c-2d3c-47e8-df32-2373c4d5e6f7",
        "customer_id": "eb1fbb55-2c99-5000-b52b-03c30ae90a03",
        "label": "South First Bungalow",
        "street": "813 S 1st St Unit B",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78704",
        "country": "US",
        "latitude": Decimal("30.252400"),
        "longitude": Decimal("-97.754800"),
        "is_default": True,
    },
    {
        "address_id": "4f5e6d7c-3e4d-48f9-ef43-3484d5e6f708",
        "customer_id": "fc20cc66-3daa-5111-c63c-14d41bf91b04",
        "label": "Hyde Park House",
        "street": "4402 Avenue A",
        "city": "Austin",
        "state": "TX",
        "postal_code": "78751",
        "country": "US",
        "latitude": Decimal("30.309500"),
        "longitude": Decimal("-97.730900"),
        "is_default": True,
    },
]

primary_address_updates = {
    "a1f1b3b2-0c85-4a4a-b311-1a3c97c3d0a1": "861a31f1-0f01-4f9b-9af8-1b3d7de6a5e0",
    "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea": "972a42e2-1e02-4aab-8b78-2c4e8ef7b6f1",
    "c35b2a16-4c4a-4e67-bd65-40d7d3c4f4b1": "b94c6404-3024-4ccd-ad9a-4e6fa008d813",
    "d48afc90-9a41-4bd7-aa25-f6053dcd5fcb": "ca5d7515-4135-4dde-beab-5f70b119e924",
    "e5fcb870-44a4-49f9-9c0e-28b7c3f7d40b": "db6e8626-5246-4eef-bfbc-6071c22af035",
    "f6d9a980-1b44-43d1-bf66-0f905c3b79b0": "ec7f9737-6357-4000-b0cd-7182d33b0046",
    "a7c2bb11-7d35-4dea-92f1-5c23bba76e0d": "fd80a848-7468-4111-b1de-8293e44c1157",
    "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e": "0e91b959-8579-4222-b2ef-93a4f55d2268",
    "c9d4dd33-0a77-4ef8-9509-e1a1e8c7f901": "1f2e3d4c-0b1a-45c6-bf10-0151a2b3c4d5",
    "da0eaa44-1b88-4ff9-a51a-f2b2f9d80902": "2f3e4d5c-1c2b-46d7-cf21-1262b3c4d5e6",
    "eb1fbb55-2c99-5000-b52b-03c30ae90a03": "3f4e5d6c-2d3c-47e8-df32-2373c4d5e6f7",
    "fc20cc66-3daa-5111-c63c-14d41bf91b04": "4f5e6d7c-3e4d-48f9-ef43-3484d5e6f708",
}

customer_profiles = [
    {
        "customer_id": "a1f1b3b2-0c85-4a4a-b311-1a3c97c3d0a1",
        "dietary_restriction": "none",
        "spice_tolerance": "hot",
        "allergies": ["none"],
        "favorite_cuisine_notes": "Prefers coastal seafood pairings",
        "language_preference": "English",
        "crm_tags": ["vip", "corporate"],
        "last_updated_by": "agent_riya",
    },
    {
        "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea",
        "dietary_restriction": "none",
        "spice_tolerance": "medium",
        "allergies": ["shellfish"],
        "favorite_cuisine_notes": "Enjoys group-style feasts with naan",
        "language_preference": "English",
        "crm_tags": ["corporate", "event_host"],
        "last_updated_by": "agent_leena",
    },
    {
        "customer_id": "c35b2a16-4c4a-4e67-bd65-40d7d3c4f4b1",
        "dietary_restriction": "vegetarian-forward",
        "spice_tolerance": "hot",
        "allergies": ["none"],
        "favorite_cuisine_notes": "Loves spinach dishes and mango cocktails",
        "language_preference": "English",
        "crm_tags": ["design_guild", "vip"],
        "last_updated_by": "agent_riya",
    },
    {
        "customer_id": "d48afc90-9a41-4bd7-aa25-f6053dcd5fcb",
        "dietary_restriction": "none",
        "spice_tolerance": "medium",
        "allergies": ["none"],
        "favorite_cuisine_notes": "Requests extra naan for the table",
        "language_preference": "English",
        "crm_tags": ["venture", "team_builder"],
        "last_updated_by": "agent_leena",
    },
    {
        "customer_id": "e5fcb870-44a4-49f9-9c0e-28b7c3f7d40b",
        "dietary_restriction": "vegetarian",
        "spice_tolerance": "medium",
        "allergies": ["dairy_sensitivity"],
        "favorite_cuisine_notes": "Enjoys plant-forward tasting flights",
        "language_preference": "English",
        "crm_tags": ["sustainability", "influencer"],
        "last_updated_by": "agent_riya",
    },
    {
        "customer_id": "f6d9a980-1b44-43d1-bf66-0f905c3b79b0",
        "dietary_restriction": "none",
        "spice_tolerance": "chef_special",
        "allergies": ["none"],
        "favorite_cuisine_notes": "Wants heat levels and adventurous specials",
        "language_preference": "English",
        "crm_tags": ["tech", "spice_club"],
        "last_updated_by": "agent_dev",
    },
    {
        "customer_id": "a7c2bb11-7d35-4dea-92f1-5c23bba76e0d",
        "dietary_restriction": "vegetarian",
        "spice_tolerance": "mild",
        "allergies": ["cashew"],
        "favorite_cuisine_notes": "Requests dairy-light sauces",
        "language_preference": "English",
        "crm_tags": ["wellness", "storyteller"],
        "last_updated_by": "agent_riya",
    },
    {
        "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e",
        "dietary_restriction": "none",
        "spice_tolerance": "hot",
        "allergies": ["none"],
        "favorite_cuisine_notes": "Prefers large-format family meals",
        "language_preference": "English",
        "crm_tags": ["legal", "vip"],
        "last_updated_by": "agent_leena",
    },
    {
        "customer_id": "c9d4dd33-0a77-4ef8-9509-e1a1e8c7f901",
        "dietary_restriction": "none",
        "spice_tolerance": "medium",
        "allergies": ["none"],
        "favorite_cuisine_notes": "Enjoys balanced tastings and dessert pairings",
        "language_preference": "English",
        "crm_tags": ["local_regular"],
        "last_updated_by": "agent_riya",
    },
    {
        "customer_id": "da0eaa44-1b88-4ff9-a51a-f2b2f9d80902",
        "dietary_restriction": "flexitarian",
        "spice_tolerance": "mild",
        "allergies": ["none"],
        "favorite_cuisine_notes": "Prefers lighter curries and vegetable sides",
        "language_preference": "English",
        "crm_tags": ["weekday_takeout"],
        "last_updated_by": "agent_riya",
    },
    {
        "customer_id": "eb1fbb55-2c99-5000-b52b-03c30ae90a03",
        "dietary_restriction": "vegetarian",
        "spice_tolerance": "medium",
        "allergies": ["none"],
        "favorite_cuisine_notes": "Requests extra greens and low-sugar mocktails",
        "language_preference": "English",
        "crm_tags": ["wellness"],
        "last_updated_by": "agent_riya",
    },
    {
        "customer_id": "fc20cc66-3daa-5111-c63c-14d41bf91b04",
        "dietary_restriction": "none",
        "spice_tolerance": "medium",
        "allergies": ["peanut"],
        "favorite_cuisine_notes": "Prefers hearty biryani and cocktail pairings",
        "language_preference": "English",
        "crm_tags": ["neighborhood"],
        "last_updated_by": "agent_dev",
    },
]

premium_customers = [
    {
        "customer_id": "a1f1b3b2-0c85-4a4a-b311-1a3c97c3d0a1",
        "qualifying_date": "2024-12-15",
        "qualification_reason": "Top 5% LTV",
        "ltv_percentile": Decimal("96.50"),
        "sentiment_avg": Decimal("0.88"),
        "concierge_notes": "Prefers window seating in Bertram's Hall",
    },
    {
        "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea",
        "qualifying_date": "2025-01-08",
        "qualification_reason": "Event host with repeat buyouts",
        "ltv_percentile": Decimal("94.10"),
        "sentiment_avg": Decimal("0.76"),
        "concierge_notes": "Needs AV support and vegan options for guests",
    },
    {
        "customer_id": "c35b2a16-4c4a-4e67-bd65-40d7d3c4f4b1",
        "qualifying_date": "2025-02-19",
        "qualification_reason": "High sentiment and upsell receptiveness",
        "ltv_percentile": Decimal("91.75"),
        "sentiment_avg": Decimal("0.82"),
        "concierge_notes": "Keep mango desserts chilled; send thank-you note",
    },
    {
        "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e",
        "qualifying_date": "2024-11-03",
        "qualification_reason": "Frequent celebratory bookings",
        "ltv_percentile": Decimal("95.20"),
        "sentiment_avg": Decimal("0.79"),
        "concierge_notes": "Offer private wine room for legal clientele",
    },
]

customer_segments = [
    {
        "segment_id": "9011a9f0-1d23-4f45-a678-0f6d8cfa1234",
        "name": "High Roller Foodies",
        "definition": {"field": "avg_order_value", "operator": ">", "value": 120},
        "is_dynamic": True,
    },
    {
        "segment_id": "a022bac1-2e34-5f56-b789-1a7e9dfb2345",
        "name": "Celebration Hosts",
        "definition": {"field": "party_size_estimate", "operator": ">=", "value": 6},
        "is_dynamic": True,
    },
    {
        "segment_id": "b033cbd2-3f45-6a67-c890-2b8fadec3456",
        "name": "Spice Adventurers",
        "definition": {"field": "spice_tolerance", "operator": "in", "value": ["hot", "chef_special"]},
        "is_dynamic": True,
    },
]

customer_segment_members = [
    {"segment_id": "9011a9f0-1d23-4f45-a678-0f6d8cfa1234", "customer_id": "a1f1b3b2-0c85-4a4a-b311-1a3c97c3d0a1", "joined_at": "2024-11-20"},
    {"segment_id": "9011a9f0-1d23-4f45-a678-0f6d8cfa1234", "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea", "joined_at": "2025-02-01"},
    {"segment_id": "9011a9f0-1d23-4f45-a678-0f6d8cfa1234", "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e", "joined_at": "2024-12-05"},
    {"segment_id": "a022bac1-2e34-5f56-b789-1a7e9dfb2345", "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea", "joined_at": "2024-12-18"},
    {"segment_id": "a022bac1-2e34-5f56-b789-1a7e9dfb2345", "customer_id": "d48afc90-9a41-4bd7-aa25-f6053dcd5fcb", "joined_at": "2025-01-10"},
    {"segment_id": "a022bac1-2e34-5f56-b789-1a7e9dfb2345", "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e", "joined_at": "2024-11-03"},
    {"segment_id": "b033cbd2-3f45-6a67-c890-2b8fadec3456", "customer_id": "c35b2a16-4c4a-4e67-bd65-40d7d3c4f4b1", "joined_at": "2025-02-19"},
    {"segment_id": "b033cbd2-3f45-6a67-c890-2b8fadec3456", "customer_id": "f6d9a980-1b44-43d1-bf66-0f905c3b79b0", "joined_at": "2025-01-05"},
    {"segment_id": "b033cbd2-3f45-6a67-c890-2b8fadec3456", "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e", "joined_at": "2024-12-05"},
]

discounts = [
    {
        "discount_id": "df111111-2222-4333-8444-555555555501",
        "name": "VIP Chef's Tasting",
        "discount_type": "percent",
        "value": Decimal("15.00"),
        "starts_at": "2024-12-01T00:00:00+00:00",
        "segment_id": "9011a9f0-1d23-4f45-a678-0f6d8cfa1234",
        "is_stackable": False,
        "notes": "Automatic 15% off tasting-friendly dishes for VIPs",
    },
    {
        "discount_id": "df222222-3333-4444-9555-666666666602",
        "name": "Family Feast Credit",
        "discount_type": "fixed",
        "value": Decimal("50.00"),
        "starts_at": "2024-11-15T00:00:00+00:00",
        "segment_id": "a022bac1-2e34-5f56-b789-1a7e9dfb2345",
        "is_stackable": False,
        "notes": "Complimentary $50 credit for celebration hosts",
    },
    {
        "discount_id": "df333333-4444-5555-a666-777777777703",
        "name": "Spice Adventurer Boost",
        "discount_type": "percent",
        "value": Decimal("10.00"),
        "starts_at": "2025-01-01T00:00:00+00:00",
        "segment_id": "b033cbd2-3f45-6a67-c890-2b8fadec3456",
        "is_stackable": False,
        "notes": "10% off heat-forward dishes for spice club members",
    },
    {
        "discount_id": "df444444-5555-6666-b777-888888888804",
        "name": "Large Party Credit",
        "discount_type": "fixed",
        "value": Decimal("100.00"),
        "starts_at": "2025-02-01T00:00:00+00:00",
        "segment_id": "a022bac1-2e34-5f56-b789-1a7e9dfb2345",
        "is_stackable": False,
        "notes": "Extra $100 off private dining packages over 15 guests",
    },
    {
        "discount_id": "df555555-6666-7777-c888-999999999905",
        "name": "Private Buyout Credit",
        "discount_type": "fixed",
        "value": Decimal("200.00"),
        "starts_at": "2025-03-01T00:00:00+00:00",
        "segment_id": "a022bac1-2e34-5f56-b789-1a7e9dfb2345",
        "is_stackable": False,
        "notes": "Applied to full-venue celebrations",
    },
]

menu_item_discounts = [
    {"menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "discount_id": "df111111-2222-4333-8444-555555555501", "channel_scope": "voice"},
    {"menu_item_id": "2c5e671b-108f-4236-96ac-c4964f049ed9", "discount_id": "df111111-2222-4333-8444-555555555501", "channel_scope": "voice"},
    {"menu_item_id": "c6f801b5-9af9-4c70-c036-6e41f2f26873", "discount_id": "df111111-2222-4333-8444-555555555501", "channel_scope": "voice"},
    {"menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "discount_id": "df111111-2222-4333-8444-555555555501", "channel_scope": "voice"},
    {"menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "discount_id": "df333333-4444-5555-a666-777777777703", "channel_scope": "voice"},
    {"menu_item_id": "f92b34e8-cd2c-4fa3-e369-91641d215ba6", "discount_id": "df333333-4444-5555-a666-777777777703", "channel_scope": "voice"},
    {"menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "discount_id": "df222222-3333-4444-9555-666666666602", "channel_scope": "voice"},
    {"menu_item_id": "4e70893d-32a1-4458-98ce-e6b86f25b7fb", "discount_id": "df222222-3333-4444-9555-666666666602", "channel_scope": "voice"},
    {"menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "discount_id": "df222222-3333-4444-9555-666666666602", "channel_scope": "voice"},
    {"menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "discount_id": "df222222-3333-4444-9555-666666666602", "channel_scope": "voice"},
]

customer_persona_overrides = [
    {
        "customer_id": "a1f1b3b2-0c85-4a4a-b311-1a3c97c3d0a1",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "tone_overrides": {"voice": "sophisticated", "pace": "unhurried"},
        "playbook_overrides": {"pre_dine_touch": "Send sommelier notes morning of reservation"},
        "valid_from": "2025-01-01T00:00:00+00:00",
        "valid_to": None,
        "last_reviewed_at": "2025-06-01T12:00:00+00:00",
    },
    {
        "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea",
        "agent_persona_id": "51c3e84b-8c5c-4de5-af05-b5c6d48b3e32",
        "tone_overrides": {"voice": "energetic", "pace": "brisk"},
        "playbook_overrides": {"pre_event_checklist": ["confirm headcount", "confirm AV needs", "confirm dessert cart"]},
        "valid_from": "2025-02-01T00:00:00+00:00",
        "valid_to": None,
        "last_reviewed_at": "2025-09-11T09:30:00+00:00",
    },
    {
        "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e",
        "agent_persona_id": "51c3e84b-8c5c-4de5-af05-b5c6d48b3e32",
        "tone_overrides": {"voice": "reassuring", "pace": "steady"},
        "playbook_overrides": {"post_event_followup": "Send handwritten thank-you within 24h"},
        "valid_from": "2024-11-05T00:00:00+00:00",
        "valid_to": None,
        "last_reviewed_at": "2025-07-20T16:30:00+00:00",
    },
]

orders = [
    {
        "order_id": "101a6fbe-0a1b-4c2d-9e3f-4a5b6c7d8e01",
        "customer_id": "a1f1b3b2-0c85-4a4a-b311-1a3c97c3d0a1",
        "placed_at": "2025-06-05T19:05:00-05:00",
        "status": "completed",
        "subtotal": Decimal("78.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("6.44"),
        "tip": Decimal("12.00"),
        "total": Decimal("96.44"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": None,
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "50101aa1-1111-4c11-9111-aaaaaaaa0001", "menu_item_id": "c6f801b5-9af9-4c70-c036-6e41f2f26873", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra fenugreek"},
            {"order_item_id": "50101aa1-2222-4c22-9222-bbbbbbbb0002", "menu_item_id": "2c5e671b-108f-4236-96ac-c4964f049ed9", "quantity": 1, "unit_price": Decimal("22.00"), "discount_applied": Decimal("0.00"), "special_requests": "Split salmon for sharing"},
            {"order_item_id": "50101aa1-3333-4c33-9333-cccccccc0003", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 1, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "50101aa1-4444-4c44-9444-dddddddd0004", "menu_item_id": "71b3bc60-65d4-478b-b621-193b91c55b2e", "quantity": 1, "unit_price": Decimal("14.00"), "discount_applied": Decimal("0.00"), "special_requests": "Serve in peacock glass"},
            {"order_item_id": "50101aa1-5555-4c55-9555-eeeeeeee0005", "menu_item_id": "60a2ab5f-54c3-467a-b510-082a80f44a1d", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Warm syrup"},
            {"order_item_id": "50101aa1-6666-4c66-9666-ffffffff0006", "menu_item_id": "82c4cd71-76e5-489c-c732-2a4ba1d66c3f", "quantity": 1, "unit_price": Decimal("12.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
        ],
    },
    {
        "order_id": "102b7fce-1b2c-4d3e-af40-5b6c7d8e9f02",
        "customer_id": "a1f1b3b2-0c85-4a4a-b311-1a3c97c3d0a1",
        "placed_at": "2025-07-14T20:10:00-05:00",
        "status": "completed",
        "subtotal": Decimal("87.00"),
        "discount_total": Decimal("13.05"),
        "tax": Decimal("6.10"),
        "tip": Decimal("15.00"),
        "total": Decimal("95.05"),
        "average_order_value_snapshot": Decimal("96.44"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": None,
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "50202bb2-1111-4d11-a111-aaaabbbb0001", "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "quantity": 1, "unit_price": Decimal("19.00"), "discount_applied": Decimal("2.85"), "special_requests": "Add extra cilantro"},
            {"order_item_id": "50202bb2-2222-4d22-a222-bbbbcccc0002", "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "quantity": 1, "unit_price": Decimal("21.00"), "discount_applied": Decimal("3.15"), "special_requests": "Medium heat"},
            {"order_item_id": "50202bb2-3333-4d33-a333-ccccdddd0003", "menu_item_id": "4e70893d-32a1-4458-98ce-e6b86f25b7fb", "quantity": 2, "unit_price": Decimal("4.00"), "discount_applied": Decimal("1.20"), "special_requests": "Brush with ghee"},
            {"order_item_id": "50202bb2-4444-4d44-a444-ddddeeee0004", "menu_item_id": "71b3bc60-65d4-478b-b621-193b91c55b2e", "quantity": 1, "unit_price": Decimal("14.00"), "discount_applied": Decimal("2.10"), "special_requests": "Include extra cherry"},
            {"order_item_id": "50202bb2-5555-4d55-a555-eeeeffff0005", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("1.20"), "special_requests": None},
            {"order_item_id": "50202bb2-6666-4d66-a666-ffff00000006", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("1.50"), "special_requests": "Salt rim"},
            {"order_item_id": "50202bb2-7777-4d77-a777-000011110007", "menu_item_id": "71a3ad60-45a4-4d2c-9e81-1f9ecbd6123e", "quantity": 1, "unit_price": Decimal("7.00"), "discount_applied": Decimal("1.05"), "special_requests": None},
        ],
    },
# Orders for other customers will be appended below
]

# Append remaining orders definitions (due to size, we'll define them in a separate list and extend)
additional_orders = [
    {
        "order_id": "201c8fde-2c3d-4e4f-b051-6c7d8e9f0a03",
        "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea",
        "placed_at": "2025-08-02T18:30:00-05:00",
        "status": "completed",
        "subtotal": Decimal("225.00"),
        "discount_total": Decimal("50.00"),
        "tax": Decimal("14.44"),
        "tip": Decimal("30.00"),
        "total": Decimal("219.44"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "delivery",
        "delivery_address_id": "a83b53f3-2f13-4bbc-9c89-3d5f9ff8c702",
        "delivery_instructions": "Use loading dock on 7th St",
        "origin_channel": "voice_agent",
        "agent_persona_id": "51c3e84b-8c5c-4de5-af05-b5c6d48b3e32",
        "items": [
            {"order_item_id": "50303cc3-1111-4e11-b111-aaaabbbb0001", "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "quantity": 3, "unit_price": Decimal("21.00"), "discount_applied": Decimal("18.00"), "special_requests": "Half pans for buffet"},
            {"order_item_id": "50303cc3-2222-4e22-b222-bbbbcccc0002", "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "quantity": 2, "unit_price": Decimal("19.00"), "discount_applied": Decimal("9.00"), "special_requests": "Sauce on the side"},
            {"order_item_id": "50303cc3-3333-4e33-b333-ccccdddd0003", "menu_item_id": "f92b34e8-cd2c-4fa3-e369-91641d215ba6", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("8.00"), "special_requests": "Extra spice packet"},
            {"order_item_id": "50303cc3-4444-4e44-b444-ddddeeee0004", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 6, "unit_price": Decimal("4.00"), "discount_applied": Decimal("5.00"), "special_requests": "Slice for easy sharing"},
            {"order_item_id": "50303cc3-5555-4e55-b555-eeeeffff0005", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 2, "unit_price": Decimal("8.00"), "discount_applied": Decimal("5.00"), "special_requests": None},
            {"order_item_id": "50303cc3-6666-4e66-b666-ffff00000006", "menu_item_id": "82c4cd71-76e5-489c-c732-2a4ba1d66c3f", "quantity": 4, "unit_price": Decimal("12.00"), "discount_applied": Decimal("5.00"), "special_requests": "Pack separately"},
        ],
    },
    {
        "order_id": "202d90ef-3d4e-4f50-c162-7d8e9f0a1b04",
        "customer_id": "b2cda2f4-6a5c-4f36-81b0-7f9d3f0fe6ea",
        "placed_at": "2025-09-10T19:00:00-05:00",
        "status": "completed",
        "subtotal": Decimal("677.00"),
        "discount_total": Decimal("100.00"),
        "tax": Decimal("47.60"),
        "tip": Decimal("85.00"),
        "total": Decimal("709.60"),
        "average_order_value_snapshot": Decimal("219.44"),
        "fulfillment_type": "catering",
        "delivery_address_id": "a83b53f3-2f13-4bbc-9c89-3d5f9ff8c702",
        "delivery_instructions": "Set buffet in Cedar boardroom",
        "origin_channel": "voice_agent",
        "agent_persona_id": "51c3e84b-8c5c-4de5-af05-b5c6d48b3e32",
        "items": [
            {"order_item_id": "50404dd4-1111-4f11-c111-aaaabbbb0001", "menu_item_id": "c6f801b5-9af9-4c70-c036-6e41f2f26873", "quantity": 6, "unit_price": Decimal("18.00"), "discount_applied": Decimal("18.00"), "special_requests": "Keep warm in chafing dishes"},
            {"order_item_id": "50404dd4-2222-4f22-c222-bbbbcccc0002", "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "quantity": 6, "unit_price": Decimal("21.00"), "discount_applied": Decimal("21.00"), "special_requests": "Bone-in portions"},
            {"order_item_id": "50404dd4-3333-4f33-c333-ccccdddd0003", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 4, "unit_price": Decimal("18.00"), "discount_applied": Decimal("12.00"), "special_requests": "Vegetable-forward"},
            {"order_item_id": "50404dd4-4444-4f44-c444-ddddeeee0004", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 4, "unit_price": Decimal("18.00"), "discount_applied": Decimal("12.00"), "special_requests": "Light salt"},
            {"order_item_id": "50404dd4-5555-4f55-c555-eeeeffff0005", "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "quantity": 5, "unit_price": Decimal("19.00"), "discount_applied": Decimal("16.00"), "special_requests": "Serve mild"},
            {"order_item_id": "50404dd4-6666-4f66-c666-ffff00000006", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 15, "unit_price": Decimal("4.00"), "discount_applied": Decimal("8.00"), "special_requests": "Cut in halves"},
            {"order_item_id": "50404dd4-7777-4f77-c777-000011110007", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 8, "unit_price": Decimal("8.00"), "discount_applied": Decimal("6.00"), "special_requests": None},
            {"order_item_id": "50404dd4-8888-4f88-c888-111122220008", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 8, "unit_price": Decimal("10.00"), "discount_applied": Decimal("7.00"), "special_requests": "Mocktail option"},
        ],
    },
    {
        "order_id": "301e101f-4e50-5051-d273-8e9f0a1b2c05",
        "customer_id": "c35b2a16-4c4a-4e67-bd65-40d7d3c4f4b1",
        "placed_at": "2025-06-20T18:45:00-05:00",
        "status": "completed",
        "subtotal": Decimal("78.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("6.44"),
        "tip": Decimal("11.00"),
        "total": Decimal("95.44"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": None,
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "50505ee5-1111-5051-d111-aaaabbbb0001", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Vegetables only"},
            {"order_item_id": "50505ee5-2222-5052-d222-bbbbcccc0002", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "50505ee5-3333-5053-d333-ccccdddd0003", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 1, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "No butter"},
            {"order_item_id": "50505ee5-4444-5054-d444-ddddeeee0004", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Less sweet"},
            {"order_item_id": "50505ee5-5555-5055-d555-eeeeffff0005", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Shareable plate"},
            {"order_item_id": "50505ee5-6666-5056-d666-ffff00000006", "menu_item_id": "b5e7f1a4-89e8-4b6f-bf25-5d30f1f15762", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "50505ee5-7777-5057-d777-000011110007", "menu_item_id": "82c4cd71-76e5-489c-c732-2a4ba1d66c3f", "quantity": 1, "unit_price": Decimal("12.00"), "discount_applied": Decimal("0.00"), "special_requests": "No sugar rim"},
        ],
    },
    {
        "order_id": "302f2120-5f61-6162-e384-9f0a1b2c3d06",
        "customer_id": "c35b2a16-4c4a-4e67-bd65-40d7d3c4f4b1",
        "placed_at": "2025-08-18T19:20:00-05:00",
        "status": "completed",
        "subtotal": Decimal("108.00"),
        "discount_total": Decimal("10.80"),
        "tax": Decimal("8.01"),
        "tip": Decimal("12.00"),
        "total": Decimal("117.21"),
        "average_order_value_snapshot": Decimal("95.44"),
        "fulfillment_type": "takeout",
        "delivery_address_id": None,
        "delivery_instructions": "Leave at host stand for pickup",
        "origin_channel": "voice_agent",
        "agent_persona_id": "41b2d73a-7b4b-4cd4-9ef4-a4b5c37a2d21",
        "items": [
            {"order_item_id": "50606ff6-1111-6161-e111-aaaabbbb0001", "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "quantity": 1, "unit_price": Decimal("19.00"), "discount_applied": Decimal("1.90"), "special_requests": None},
            {"order_item_id": "50606ff6-2222-6162-e222-bbbbcccc0002", "menu_item_id": "f92b34e8-cd2c-4fa3-e369-91641d215ba6", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("1.80"), "special_requests": "Spice level hot"},
            {"order_item_id": "50606ff6-3333-6163-e333-ccccdddd0003", "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "quantity": 1, "unit_price": Decimal("21.00"), "discount_applied": Decimal("2.10"), "special_requests": "Cut into thirds"},
            {"order_item_id": "50606ff6-4444-6164-e444-ddddeeee0004", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("1.80"), "special_requests": None},
            {"order_item_id": "50606ff6-5555-6165-e555-eeeeffff0005", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 4, "unit_price": Decimal("4.00"), "discount_applied": Decimal("1.60"), "special_requests": "No butter"},
            {"order_item_id": "50606ff6-6666-6166-e666-ffff00000006", "menu_item_id": "60a2ab5f-54c3-467a-b510-082a80f44a1d", "quantity": 2, "unit_price": Decimal("8.00"), "discount_applied": Decimal("1.60"), "special_requests": "Serve warm"},
        ],
    },
    {
        "order_id": "30303321-6072-7273-f495-a1b2c3d4e507",
        "customer_id": "c35b2a16-4c4a-4e67-bd65-40d7d3c4f4b1",
        "placed_at": "2025-09-22T12:30:00-05:00",
        "status": "completed",
        "subtotal": Decimal("234.00"),
        "discount_total": Decimal("23.40"),
        "tax": Decimal("17.37"),
        "tip": Decimal("30.00"),
        "total": Decimal("257.97"),
        "average_order_value_snapshot": Decimal("106.33"),
        "fulfillment_type": "takeout",
        "delivery_address_id": "b94c6404-3024-4ccd-ad9a-4e6fa008d813",
        "delivery_instructions": "Ring doorbell for loft drop-off",
        "origin_channel": "voice_agent",
        "agent_persona_id": "41b2d73a-7b4b-4cd4-9ef4-a4b5c37a2d21",
        "items": [
            {"order_item_id": "50707aa7-1111-7271-f111-aaaabbbb0001", "menu_item_id": "2c5e671b-108f-4236-96ac-c4964f049ed9", "quantity": 2, "unit_price": Decimal("22.00"), "discount_applied": Decimal("4.40"), "special_requests": "Charred finish"},
            {"order_item_id": "50707aa7-2222-7272-f222-bbbbcccc0002", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("3.60"), "special_requests": "Vegetarian prepare"},
            {"order_item_id": "50707aa7-3333-7273-f333-ccccdddd0003", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("3.60"), "special_requests": "Light salt"},
            {"order_item_id": "50707aa7-4444-7274-f444-ddddeeee0004", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 6, "unit_price": Decimal("4.00"), "discount_applied": Decimal("2.40"), "special_requests": "Add chili oil"},
            {"order_item_id": "50707aa7-5555-7275-f555-eeeeffff0005", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 4, "unit_price": Decimal("10.00"), "discount_applied": Decimal("4.00"), "special_requests": "Half mocktails"},
            {"order_item_id": "50707aa7-6666-7276-f666-ffff00000006", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 3, "unit_price": Decimal("8.00"), "discount_applied": Decimal("2.40"), "special_requests": None},
            {"order_item_id": "50707aa7-7777-7277-f777-000011110007", "menu_item_id": "71a3ad60-45a4-4d2c-9e81-1f9ecbd6123e", "quantity": 2, "unit_price": Decimal("7.00"), "discount_applied": Decimal("1.40"), "special_requests": None},
            {"order_item_id": "50707aa7-8888-7278-f888-111122220008", "menu_item_id": "b5e7f1a4-89e8-4b6f-bf25-5d30f1f15762", "quantity": 2, "unit_price": Decimal("8.00"), "discount_applied": Decimal("1.60"), "special_requests": "Serve with extra sauce"},
        ],
    },
    {
        "order_id": "40114232-7183-8384-0516-b2c3d4e5f608",
        "customer_id": "d48afc90-9a41-4bd7-aa25-f6053dcd5fcb",
        "placed_at": "2025-05-30T19:00:00-05:00",
        "status": "completed",
        "subtotal": Decimal("303.00"),
        "discount_total": Decimal("50.00"),
        "tax": Decimal("20.85"),
        "tip": Decimal("45.00"),
        "total": Decimal("318.85"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": "Reserved in Bertram's Hall",
        "origin_channel": "voice_agent",
        "agent_persona_id": "51c3e84b-8c5c-4de5-af05-b5c6d48b3e32",
        "items": [
            {"order_item_id": "50808bb8-1111-8381-0511-aaaabbbb0001", "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "quantity": 3, "unit_price": Decimal("21.00"), "discount_applied": Decimal("12.00"), "special_requests": "Serve family-style"},
            {"order_item_id": "50808bb8-2222-8382-0522-bbbbcccc0002", "menu_item_id": "c6f801b5-9af9-4c70-c036-6e41f2f26873", "quantity": 3, "unit_price": Decimal("18.00"), "discount_applied": Decimal("9.00"), "special_requests": "Extra sauce pitcher"},
            {"order_item_id": "50808bb8-3333-8383-0533-ccccdddd0003", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("6.00"), "special_requests": "Vegetarian prep"},
            {"order_item_id": "50808bb8-4444-8384-0544-ddddeeee0004", "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "quantity": 2, "unit_price": Decimal("19.00"), "discount_applied": Decimal("6.00"), "special_requests": "Mild spice"},
            {"order_item_id": "50808bb8-5555-8385-0555-eeeeffff0005", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 8, "unit_price": Decimal("4.00"), "discount_applied": Decimal("5.00"), "special_requests": "Keep warm"},
            {"order_item_id": "50808bb8-6666-8386-0566-ffff00000006", "menu_item_id": "71b3bc60-65d4-478b-b621-193b91c55b2e", "quantity": 4, "unit_price": Decimal("14.00"), "discount_applied": Decimal("8.00"), "special_requests": "Garnish with orange"},
            {"order_item_id": "50808bb8-7777-8387-0577-000011110007", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 3, "unit_price": Decimal("8.00"), "discount_applied": Decimal("4.00"), "special_requests": None},
        ],
    },
    {
        "order_id": "40225343-8294-9495-1627-c3d4e5f60719",
        "customer_id": "d48afc90-9a41-4bd7-aa25-f6053dcd5fcb",
        "placed_at": "2025-07-22T12:15:00-05:00",
        "status": "completed",
        "subtotal": Decimal("106.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("8.75"),
        "tip": Decimal("14.00"),
        "total": Decimal("128.75"),
        "average_order_value_snapshot": Decimal("318.85"),
        "fulfillment_type": "takeout",
        "delivery_address_id": None,
        "delivery_instructions": "Curbside pickup ",
        "origin_channel": "voice_agent",
        "agent_persona_id": "41b2d73a-7b4b-4cd4-9ef4-a4b5c37a2d21",
        "items": [
            {"order_item_id": "50909cc9-1111-9491-1611-aaaabbbb0001", "menu_item_id": "f92b34e8-cd2c-4fa3-e369-91641d215ba6", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra spicy"},
            {"order_item_id": "50909cc9-2222-9492-1622-bbbbcccc0002", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "50909cc9-3333-9493-1633-ccccdddd0003", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 4, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra garlic"},
            {"order_item_id": "50909cc9-4444-9494-1644-ddddeeee0004", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 2, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "50909cc9-5555-9495-1655-eeeeffff0005", "menu_item_id": "60a2ab5f-54c3-467a-b510-082a80f44a1d", "quantity": 2, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
        ],
    },
    {
        "order_id": "50136454-93a5-a5a6-2738-d4e5f607182a",
        "customer_id": "e5fcb870-44a4-49f9-9c0e-28b7c3f7d40b",
        "placed_at": "2025-06-11T19:15:00-05:00",
        "status": "completed",
        "subtotal": Decimal("92.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("7.59"),
        "tip": Decimal("13.50"),
        "total": Decimal("113.09"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": "Allergies flagged with kitchen",
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "51010dd0-1111-a5a1-2711-aaaabbbb0001", "menu_item_id": "82b4be71-56b5-4e3d-ad92-2a0fdece234f", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Add tamarind"},
            {"order_item_id": "51010dd0-2222-a5a2-2722-bbbbcccc0002", "menu_item_id": "a4d6e093-78d7-4a5f-af14-4c2ff0e04651", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra hummus"},
            {"order_item_id": "51010dd0-3333-a5a3-2733-ccccdddd0003", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Prepare vegan"},
            {"order_item_id": "51010dd0-4444-a5a4-2744-ddddeeee0004", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "51010dd0-5555-a5a5-2755-eeeeffff0005", "menu_item_id": "4e70893d-32a1-4458-98ce-e6b86f25b7fb", "quantity": 2, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "No butter"},
            {"order_item_id": "51010dd0-6666-a5a6-2766-ffff00000006", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Birthday inscription"},
            {"order_item_id": "51010dd0-7777-a5a7-2777-000011110007", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "51010dd0-8888-a5a8-2788-111122220008", "menu_item_id": "82c4cd71-76e5-489c-c732-2a4ba1d66c3f", "quantity": 1, "unit_price": Decimal("12.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
        ],
    },
    {
        "order_id": "50247565-a4b6-b6b7-3849-e5f607182b3c",
        "customer_id": "e5fcb870-44a4-49f9-9c0e-28b7c3f7d40b",
        "placed_at": "2025-09-05T18:40:00-05:00",
        "status": "completed",
        "subtotal": Decimal("196.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("16.17"),
        "tip": Decimal("29.00"),
        "total": Decimal("241.17"),
        "average_order_value_snapshot": Decimal("113.09"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": "Chef's table seating",
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "51111ee1-1111-b6b1-3811-aaaabbbb0001", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Split plating"},
            {"order_item_id": "51111ee1-2222-b6b2-3822-bbbbcccc0002", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "51111ee1-3333-b6b3-3833-ccccdddd0003", "menu_item_id": "71a3ad60-45a4-4d2c-9e81-1f9ecbd6123e", "quantity": 2, "unit_price": Decimal("7.00"), "discount_applied": Decimal("0.00"), "special_requests": "Add toasted seeds"},
            {"order_item_id": "51111ee1-4444-b6b4-3844-ddddeeee0004", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 4, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "Brush with olive oil"},
            {"order_item_id": "51111ee1-5555-b6b5-3855-eeeeffff0005", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 3, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Serve with berries"},
            {"order_item_id": "51111ee1-6666-b6b6-3866-ffff00000006", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 3, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Salt rim"},
            {"order_item_id": "51111ee1-7777-b6b7-3877-000011110007", "menu_item_id": "82c4cd71-76e5-489c-c732-2a4ba1d66c3f", "quantity": 2, "unit_price": Decimal("12.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "51111ee1-8888-b6b8-3888-111122220008", "menu_item_id": "b5e7f1a4-89e8-4b6f-bf25-5d30f1f15762", "quantity": 2, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Light char"},
        ],
    },
    {
        "order_id": "60158676-b5c7-c7c8-495a-f607182b3c4d",
        "customer_id": "f6d9a980-1b44-43d1-bf66-0f905c3b79b0",
        "placed_at": "2025-05-18T20:05:00-05:00",
        "status": "completed",
        "subtotal": Decimal("133.00"),
        "discount_total": Decimal("13.30"),
        "tax": Decimal("9.87"),
        "tip": Decimal("17.00"),
        "total": Decimal("146.57"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": "Pairing with IPA flight",
        "origin_channel": "voice_agent",
        "agent_persona_id": "41b2d73a-7b4b-4cd4-9ef4-a4b5c37a2d21",
        "items": [
            {"order_item_id": "51212ff2-1111-c7c1-4911-aaaabbbb0001", "menu_item_id": "f92b34e8-cd2c-4fa3-e369-91641d215ba6", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("3.60"), "special_requests": "Chef special heat"},
            {"order_item_id": "51212ff2-2222-c7c2-4922-bbbbcccc0002", "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "quantity": 1, "unit_price": Decimal("21.00"), "discount_applied": Decimal("2.10"), "special_requests": None},
            {"order_item_id": "51212ff2-3333-c7c3-4933-ccccdddd0003", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("1.80"), "special_requests": "Add chili oil"},
            {"order_item_id": "51212ff2-4444-c7c4-4944-ddddeeee0004", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 3, "unit_price": Decimal("4.00"), "discount_applied": Decimal("1.20"), "special_requests": "Brush with ghee"},
            {"order_item_id": "51212ff2-5555-c7c5-4955-eeeeffff0005", "menu_item_id": "71b3bc60-65d4-478b-b621-193b91c55b2e", "quantity": 2, "unit_price": Decimal("14.00"), "discount_applied": Decimal("2.80"), "special_requests": "Serve smoky"},
            {"order_item_id": "51212ff2-6666-c7c6-4966-ffff00000006", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("1.00"), "special_requests": None},
            {"order_item_id": "51212ff2-7777-c7c7-4977-000011110007", "menu_item_id": "60a2ab5f-54c3-467a-b510-082a80f44a1d", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.80"), "special_requests": None},
        ],
    },
    {
        "order_id": "60269787-c6d8-d8d9-5a6b-07182b3c4d5e",
        "customer_id": "f6d9a980-1b44-43d1-bf66-0f905c3b79b0",
        "placed_at": "2025-07-26T21:10:00-05:00",
        "status": "completed",
        "subtotal": Decimal("85.00"),
        "discount_total": Decimal("8.50"),
        "tax": Decimal("6.31"),
        "tip": Decimal("11.00"),
        "total": Decimal("94.81"),
        "average_order_value_snapshot": Decimal("146.57"),
        "fulfillment_type": "takeout",
        "delivery_address_id": "ec7f9737-6357-4000-b0cd-7182d33b0046",
        "delivery_instructions": "Drop at concierge desk",
        "origin_channel": "voice_agent",
        "agent_persona_id": "41b2d73a-7b4b-4cd4-9ef4-a4b5c37a2d21",
        "items": [
            {"order_item_id": "51313aa3-1111-d8d1-5a11-aaaabbbb0001", "menu_item_id": "f92b34e8-cd2c-4fa3-e369-91641d215ba6", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("1.80"), "special_requests": "Chef special heat"},
            {"order_item_id": "51313aa3-2222-d8d2-5a22-bbbbcccc0002", "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "quantity": 1, "unit_price": Decimal("19.00"), "discount_applied": Decimal("1.90"), "special_requests": "No bell peppers"},
            {"order_item_id": "51313aa3-3333-d8d3-5a33-ccccdddd0003", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 2, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.80"), "special_requests": None},
            {"order_item_id": "51313aa3-4444-d8d4-5a44-ddddeeee0004", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 2, "unit_price": Decimal("10.00"), "discount_applied": Decimal("2.00"), "special_requests": "Rim with tajin"},
            {"order_item_id": "51313aa3-5555-d8d5-5a55-eeeeffff0005", "menu_item_id": "82c4cd71-76e5-489c-c732-2a4ba1d66c3f", "quantity": 1, "unit_price": Decimal("12.00"), "discount_applied": Decimal("1.20"), "special_requests": None},
            {"order_item_id": "51313aa3-6666-d8d6-5a66-ffff00000006", "menu_item_id": "b5e7f1a4-89e8-4b6f-bf25-5d30f1f15762", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.80"), "special_requests": None},
        ],
    },
    {
        "order_id": "7017a898-d6e9-e9ea-6b7c-182b3c4d5e6f",
        "customer_id": "a7c2bb11-7d35-4dea-92f1-5c23bba76e0d",
        "placed_at": "2025-06-02T13:05:00-05:00",
        "status": "completed",
        "subtotal": Decimal("85.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("7.01"),
        "tip": Decimal("10.00"),
        "total": Decimal("102.01"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": "Allergy flag: cashew",
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "51414bb4-1111-e9e1-6b11-aaaabbbb0001", "menu_item_id": "71a3ad60-45a4-4d2c-9e81-1f9ecbd6123e", "quantity": 1, "unit_price": Decimal("7.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "51414bb4-2222-e9e2-6b22-bbbbcccc0002", "menu_item_id": "82b4be71-56b5-4e3d-ad92-2a0fdece234f", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "No yogurt drizzle"},
            {"order_item_id": "51414bb4-3333-e9e3-6b33-ccccdddd0003", "menu_item_id": "b5e7f1a4-89e8-4b6f-bf25-5d30f1f15762", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Light sauce"},
            {"order_item_id": "51414bb4-4444-e9e4-6b44-ddddeeee0004", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "No cashews"},
            {"order_item_id": "51414bb4-5555-e9e5-6b55-eeeeffff0005", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Coconut milk"},
            {"order_item_id": "51414bb4-6666-e9e6-6b66-ffff00000006", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 2, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "No butter"},
            {"order_item_id": "51414bb4-7777-e9e7-6b77-000011110007", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Dairy-free garnish"},
            {"order_item_id": "51414bb4-8888-e9e8-6b88-111122220008", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Virgin"},
        ],
    },
    {
        "order_id": "7028b909-e7fa-fafb-7c8d-293c4d5e6f70",
        "customer_id": "a7c2bb11-7d35-4dea-92f1-5c23bba76e0d",
        "placed_at": "2025-08-30T18:20:00-05:00",
        "status": "completed",
        "subtotal": Decimal("210.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("17.33"),
        "tip": Decimal("30.00"),
        "total": Decimal("257.33"),
        "average_order_value_snapshot": Decimal("102.01"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": "Large booth with soft seating",
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "51515cc5-1111-faf1-7c11-aaaabbbb0001", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Lite spice"},
            {"order_item_id": "51515cc5-2222-faf2-7c22-bbbbcccc0002", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 2, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Coconut milk"},
            {"order_item_id": "51515cc5-3333-faf3-7c33-ccccdddd0003", "menu_item_id": "b5e7f1a4-89e8-4b6f-bf25-5d30f1f15762", "quantity": 2, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Roast lightly"},
            {"order_item_id": "51515cc5-4444-faf4-7c44-ddddeeee0004", "menu_item_id": "a4d6e093-78d7-4a5f-af14-4c2ff0e04651", "quantity": 2, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Serve on platters"},
            {"order_item_id": "51515cc5-5555-faf5-7c55-eeeeffff0005", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 6, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "No butter"},
            {"order_item_id": "51515cc5-6666-faf6-7c66-ffff00000006", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 3, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Dairy-free garnish"},
            {"order_item_id": "51515cc5-7777-faf7-7c77-000011110007", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 3, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Mocktails"},
            {"order_item_id": "51515cc5-8888-faf8-7c88-111122220008", "menu_item_id": "82c4cd71-76e5-489c-c732-2a4ba1d66c3f", "quantity": 2, "unit_price": Decimal("12.00"), "discount_applied": Decimal("0.00"), "special_requests": "Half sweetness"},
        ],
    },
    {
        "order_id": "8019ca1a-f80b-0b0c-7d8e-3c4d5e6f7081",
        "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e",
        "placed_at": "2025-05-12T19:30:00-05:00",
        "status": "completed",
        "subtotal": Decimal("212.00"),
        "discount_total": Decimal("50.00"),
        "tax": Decimal("13.37"),
        "tip": Decimal("25.00"),
        "total": Decimal("200.37"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": "Wine room tasting menu",
        "origin_channel": "voice_agent",
        "agent_persona_id": "51c3e84b-8c5c-4de5-af05-b5c6d48b3e32",
        "items": [
            {"order_item_id": "51616dd6-1111-0b01-7d11-aaaabbbb0001", "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "quantity": 2, "unit_price": Decimal("21.00"), "discount_applied": Decimal("12.00"), "special_requests": None},
            {"order_item_id": "51616dd6-2222-0b02-7d22-bbbbcccc0002", "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "quantity": 2, "unit_price": Decimal("19.00"), "discount_applied": Decimal("9.00"), "special_requests": "Less cream"},
            {"order_item_id": "51616dd6-3333-0b03-7d33-ccccdddd0003", "menu_item_id": "c6f801b5-9af9-4c70-c036-6e41f2f26873", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("4.00"), "special_requests": "Mild"},
            {"order_item_id": "51616dd6-4444-0b04-7d44-ddddeeee0004", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("4.00"), "special_requests": None},
            {"order_item_id": "51616dd6-5555-0b05-7d55-eeeeffff0005", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 6, "unit_price": Decimal("4.00"), "discount_applied": Decimal("6.00"), "special_requests": "Extra baskets"},
            {"order_item_id": "51616dd6-6666-0b06-7d66-ffff00000006", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 4, "unit_price": Decimal("10.00"), "discount_applied": Decimal("7.00"), "special_requests": "Premium tequila"},
            {"order_item_id": "51616dd6-8888-0b08-7d88-111122220008", "menu_item_id": "60a2ab5f-54c3-467a-b510-082a80f44a1d", "quantity": 4, "unit_price": Decimal("8.00"), "discount_applied": Decimal("8.00"), "special_requests": None},
        ],
    },
    {
        "order_id": "802adb2b-091c-1c1d-8e9f-4d5e6f708192",
        "customer_id": "b8d3cc22-9e46-4cfa-83d2-6d34ccd87f1e",
        "placed_at": "2025-07-19T18:00:00-05:00",
        "status": "completed",
        "subtotal": Decimal("763.00"),
        "discount_total": Decimal("200.00"),
        "tax": Decimal("46.46"),
        "tip": Decimal("110.00"),
        "total": Decimal("719.46"),
        "average_order_value_snapshot": Decimal("200.37"),
        "fulfillment_type": "catering",
        "delivery_address_id": "0e91b959-8579-4222-b2ef-93a4f55d2268",
        "delivery_instructions": "Birthday in backyard pavilion",
        "origin_channel": "voice_agent",
        "agent_persona_id": "51c3e84b-8c5c-4de5-af05-b5c6d48b3e32",
        "items": [
            {"order_item_id": "51717ee7-1111-1c11-8e11-aaaabbbb0001", "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "quantity": 5, "unit_price": Decimal("21.00"), "discount_applied": Decimal("30.00"), "special_requests": "Half tray format"},
            {"order_item_id": "51717ee7-2222-1c22-8e22-bbbbcccc0002", "menu_item_id": "c6f801b5-9af9-4c70-c036-6e41f2f26873", "quantity": 5, "unit_price": Decimal("18.00"), "discount_applied": Decimal("24.00"), "special_requests": "Serve mild"},
            {"order_item_id": "51717ee7-3333-1c33-8e33-ccccdddd0003", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 4, "unit_price": Decimal("18.00"), "discount_applied": Decimal("16.00"), "special_requests": "Vegetarian focus"},
            {"order_item_id": "51717ee7-4444-1c44-8e44-ddddeeee0004", "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "quantity": 4, "unit_price": Decimal("19.00"), "discount_applied": Decimal("20.00"), "special_requests": "Mild"},
            {"order_item_id": "51717ee7-5555-1c55-8e55-eeeeffff0005", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 4, "unit_price": Decimal("18.00"), "discount_applied": Decimal("16.00"), "special_requests": "Include gluten-free tray"},
            {"order_item_id": "51717ee7-6666-1c66-8e66-ffff00000006", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 22, "unit_price": Decimal("4.00"), "discount_applied": Decimal("22.00"), "special_requests": "Individually wrapped"},
            {"order_item_id": "51717ee7-7777-1c77-8e77-000011110007", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 6, "unit_price": Decimal("8.00"), "discount_applied": Decimal("12.00"), "special_requests": "Assorted toppings"},
            {"order_item_id": "51717ee7-8888-1c88-8e88-111122220008", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 8, "unit_price": Decimal("10.00"), "discount_applied": Decimal("16.00"), "special_requests": "Half mocktails"},
            {"order_item_id": "51717ee7-9999-1c99-8e99-222233330009", "menu_item_id": "71b3bc60-65d4-478b-b621-193b91c55b2e", "quantity": 6, "unit_price": Decimal("14.00"), "discount_applied": Decimal("30.00"), "special_requests": "Batch in growlers"},
            {"order_item_id": "51717ee7-aaaa-1caa-8eaa-33334444000a", "menu_item_id": "93c5cf82-67c6-4f4e-be03-3b1eefdf3450", "quantity": 6, "unit_price": Decimal("8.00"), "discount_applied": Decimal("14.00"), "special_requests": "Serve with chutney trio"},
        ],
    },
    {
        "order_id": "9030da4e-0f1a-4c5d-9b6e-7f8a9b0c1d01",
        "customer_id": "c9d4dd33-0a77-4ef8-9509-e1a1e8c7f901",
        "placed_at": "2025-07-08T18:25:00-05:00",
        "status": "completed",
        "subtotal": Decimal("70.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("5.78"),
        "tip": Decimal("12.00"),
        "total": Decimal("87.78"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": None,
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "51818ee8-1111-0c11-8e11-aaaabbbb0001", "menu_item_id": "93c5cf82-67c6-4f4e-be03-3b1eefdf3450", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra chutney"},
            {"order_item_id": "51818ee8-2222-0c22-8e22-bbbbcccc0002", "menu_item_id": "c6f801b5-9af9-4c70-c036-6e41f2f26873", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Chicken protein"},
            {"order_item_id": "51818ee8-3333-0c33-8e33-ccccdddd0003", "menu_item_id": "e81a23d7-bc1b-4e92-d258-80530c104a95", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Vegetarian style"},
            {"order_item_id": "51818ee8-4444-0c44-8e44-ddddeeee0004", "menu_item_id": "4e70893d-32a1-4458-98ce-e6b86f25b7fb", "quantity": 2, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "Brush with ghee"},
            {"order_item_id": "51818ee8-5555-0c55-8e55-eeeeffff0005", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Salt rim"},
            {"order_item_id": "51818ee8-6666-0c66-8e66-ffff00000006", "menu_item_id": "60a2ab5f-54c3-467a-b510-082a80f44a1d", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Birthday note"},
        ],
    },
    {
        "order_id": "9041eb5f-1f2b-5d6e-ac7f-8a9b0c1d2e02",
        "customer_id": "da0eaa44-1b88-4ff9-a51a-f2b2f9d80902",
        "placed_at": "2025-06-18T19:10:00-05:00",
        "status": "completed",
        "subtotal": Decimal("74.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("6.11"),
        "tip": Decimal("11.00"),
        "total": Decimal("91.11"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "takeout",
        "delivery_address_id": None,
        "delivery_instructions": "Pickup at side entrance",
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "51919ff9-1111-0d11-9f11-aaaabbbb0001", "menu_item_id": "82b4be71-56b5-4e3d-ad92-2a0fdece234f", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra tamarind chutney"},
            {"order_item_id": "51919ff9-2222-0d22-9f22-bbbbcccc0002", "menu_item_id": "0a3c45f9-de3d-40b4-f47a-a2742de26cb7", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Paneer option"},
            {"order_item_id": "51919ff9-3333-0d33-9f33-ccccdddd0003", "menu_item_id": "b5e7f1a4-89e8-4b6f-bf25-5d30f1f15762", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra sauce"},
            {"order_item_id": "51919ff9-4444-0d44-9f44-ddddeeee0004", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 1, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "No butter"},
            {"order_item_id": "51919ff9-5555-0d55-9f55-eeeeffff0005", "menu_item_id": "4e70893d-32a1-4458-98ce-e6b86f25b7fb", "quantity": 1, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "Light toast"},
            {"order_item_id": "51919ff9-6666-0d66-9f66-ffff00000006", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "51919ff9-7777-0d77-9f77-000011110007", "menu_item_id": "71b3bc60-65d4-478b-b621-193b91c55b2e", "quantity": 1, "unit_price": Decimal("14.00"), "discount_applied": Decimal("0.00"), "special_requests": "Less sweet"},
            {"order_item_id": "51919ff9-8888-0d88-9f88-111122220008", "menu_item_id": "60a2ab5f-54c3-467a-b510-082a80f44a1d", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
        ],
    },
    {
        "order_id": "9052fc70-203c-607f-bd80-9b0c1d2e3f03",
        "customer_id": "eb1fbb55-2c99-5000-b52b-03c30ae90a03",
        "placed_at": "2025-08-12T18:55:00-05:00",
        "status": "completed",
        "subtotal": Decimal("85.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("7.01"),
        "tip": Decimal("13.00"),
        "total": Decimal("105.01"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": "Window booth, low lighting",
        "origin_channel": "voice_agent",
        "agent_persona_id": "31a1c629-6a3a-4ab3-8df3-93a4b2691c10",
        "items": [
            {"order_item_id": "52020010-1111-0e11-af11-aaaabbbb0001", "menu_item_id": "a4d6e093-78d7-4a5f-af14-4c2ff0e04651", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Serve crisp"},
            {"order_item_id": "52020010-2222-0e22-af22-bbbbcccc0002", "menu_item_id": "1b4d560a-ff4e-4125-858b-b3853ef37dc8", "quantity": 1, "unit_price": Decimal("19.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra sauce on side"},
            {"order_item_id": "52020010-3333-0e33-af33-ccccdddd0003", "menu_item_id": "f92b34e8-cd2c-4fa3-e369-91641d215ba6", "quantity": 1, "unit_price": Decimal("18.00"), "discount_applied": Decimal("0.00"), "special_requests": "Medium spice"},
            {"order_item_id": "52020010-4444-0e44-af44-ddddeeee0004", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 1, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "No butter"},
            {"order_item_id": "52020010-5555-0e55-af55-eeeeffff0005", "menu_item_id": "4e70893d-32a1-4458-98ce-e6b86f25b7fb", "quantity": 1, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "Light toast"},
            {"order_item_id": "52020010-6666-0e66-af66-ffff00000006", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Shareable"},
            {"order_item_id": "52020010-7777-0e77-af77-000011110007", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Mocktail"},
            {"order_item_id": "52020010-8888-0e88-af88-111122220008", "menu_item_id": "82c4cd71-76e5-489c-c732-2a4ba1d66c3f", "quantity": 1, "unit_price": Decimal("12.00"), "discount_applied": Decimal("0.00"), "special_requests": "No sugar rim"},
        ],
    },
    {
        "order_id": "90630d81-314d-7180-ce91-ac0d1e2f3f04",
        "customer_id": "fc20cc66-3daa-5111-c63c-14d41bf91b04",
        "placed_at": "2025-09-04T20:05:00-05:00",
        "status": "completed",
        "subtotal": Decimal("76.00"),
        "discount_total": Decimal("0.00"),
        "tax": Decimal("6.27"),
        "tip": Decimal("11.00"),
        "total": Decimal("93.27"),
        "average_order_value_snapshot": Decimal("0.00"),
        "fulfillment_type": "dine_in",
        "delivery_address_id": None,
        "delivery_instructions": "Allergy: no peanuts",
        "origin_channel": "voice_agent",
        "agent_persona_id": "41b2d73a-7b4b-4cd4-9ef4-a4b5c37a2d21",
        "items": [
            {"order_item_id": "52121121-1111-0f11-b011-aaaabbbb0001", "menu_item_id": "93c5cf82-67c6-4f4e-be03-3b1eefdf3450", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra chutney"},
            {"order_item_id": "52121121-2222-0f22-b022-bbbbcccc0002", "menu_item_id": "d70912c6-ab0a-4d81-d147-7f52f3f37984", "quantity": 1, "unit_price": Decimal("21.00"), "discount_applied": Decimal("0.00"), "special_requests": "Bone-in"},
            {"order_item_id": "52121121-3333-0f33-b033-ccccdddd0003", "menu_item_id": "3d6f782c-2190-4347-b7bd-d5a75f15a6ea", "quantity": 1, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "Light char"},
            {"order_item_id": "52121121-4444-0f44-b044-ddddeeee0004", "menu_item_id": "93d5de82-87f6-49ad-ad43-3b5cc1e77d40", "quantity": 1, "unit_price": Decimal("10.00"), "discount_applied": Decimal("0.00"), "special_requests": "Salt rim"},
            {"order_item_id": "52121121-5555-0f55-b055-eeeeffff0005", "menu_item_id": "71b3bc60-65d4-478b-b621-193b91c55b2e", "quantity": 1, "unit_price": Decimal("14.00"), "discount_applied": Decimal("0.00"), "special_requests": "Extra citrus"},
            {"order_item_id": "52121121-6666-0f66-b066-ffff00000006", "menu_item_id": "5f819a4e-43b2-4569-a9df-f7c97f36c90c", "quantity": 1, "unit_price": Decimal("8.00"), "discount_applied": Decimal("0.00"), "special_requests": None},
            {"order_item_id": "52121121-7777-0f77-b077-000011110007", "menu_item_id": "71a3ad60-45a4-4d2c-9e81-1f9ecbd6123e", "quantity": 1, "unit_price": Decimal("7.00"), "discount_applied": Decimal("0.00"), "special_requests": "Add seeds"},
            {"order_item_id": "52121121-8888-0f88-b088-111122220008", "menu_item_id": "4e70893d-32a1-4458-98ce-e6b86f25b7fb", "quantity": 1, "unit_price": Decimal("4.00"), "discount_applied": Decimal("0.00"), "special_requests": "No butter"},
        ],
    },
]

orders.extend(additional_orders)

# Validate totals
for order in orders:
    subtotal_calc = sum(item["unit_price"] * item["quantity"] for item in order["items"])
    discount_calc = sum(item["discount_applied"] for item in order["items"])
    if subtotal_calc != order["subtotal"]:
        raise ValueError(f"Subtotal mismatch for order {order['order_id']}: {subtotal_calc} != {order['subtotal']}")
    if round(discount_calc, 2) != float(order["discount_total"]):
        # Accept small rounding differences within 0.01
        if abs(discount_calc - order["discount_total"]) > Decimal("0.02"):
            raise ValueError(f"Discount mismatch for order {order['order_id']}: {discount_calc} != {order['discount_total']}")

agent_interactions = []
interaction_transcripts = []
transcript_media = []

# Helper to add interactions
from datetime import timedelta, datetime

interaction_map = [
    {
        "order_index": 0,
        "interaction_id": "901aa111-b123-4c45-9a67-abcde0000001",
        "started_at_offset": -20,
        "duration_minutes": 12,
        "intent": "dine_in_reservation",
        "sentiment_score": Decimal("0.82"),
        "summary": "Booked chef-led tasting for two with cocktail pairings.",
        "audio_reference": "s3://clay-pit-interactions/audio/2025/2025-06-05-asha-call.mp3",
        "transcript": [
            ("customer", "Hi, I'd love to plan an indulgent dinner for two tonight-can you help me mix seafood and spice?"),
            ("agent", "Absolutely! I'll reserve Bertram's alcove and pair the kothmir salmon with our peacock cocktail."),
            ("customer", "Perfect, please add the gulab jamun to finish-my partner adores it.")
        ],
        "confidence": [0.95, 0.97, 0.96],
    },
    {
        "order_index": 1,
        "interaction_id": "901aa112-b123-4c45-9a67-abcde0000002",
        "started_at_offset": -25,
        "duration_minutes": 15,
        "intent": "vip_recommendation",
        "sentiment_score": Decimal("0.88"),
        "summary": "Curated upgraded tasting with VIP chef's tasting discount applied.",
        "audio_reference": "s3://clay-pit-interactions/audio/2025/2025-07-14-asha-vip.mp3",
        "transcript": [
            ("customer", "We're celebrating a product launch-can you surprise us with the chef's favorites?"),
            ("agent", "I'll layer butter chicken, goat biryani, and a custom cocktail flight, then apply your VIP tasting credit."),
            ("customer", "That's why I call you first-lock it in for eight o'clock."),
        ],
        "confidence": [0.94, 0.98, 0.96],
    },
    {
        "order_index": 2,
        "interaction_id": "901aa113-b123-4c45-9a67-abcde0000003",
        "started_at_offset": -40,
        "duration_minutes": 18,
        "intent": "group_catering_quote",
        "sentiment_score": Decimal("0.71"),
        "summary": "Scheduled delivery for offsite leadership dinner with buffet setup.",
        "audio_reference": "s3://clay-pit-interactions/audio/2025/2025-08-02-jason-team.mp3",
        "transcript": [
            ("customer", "I need hearty dishes for eight execs-think biryani, butter chicken, and desserts."),
            ("agent", "I'll arrange a delivery with naan baskets, cake, and apply your celebration credit."),
            ("customer", "Perfect, have it staged by 6:45 with serving utensils."),
        ],
        "confidence": [0.92, 0.95, 0.93],
    },
    {
        "order_index": 3,
        "interaction_id": "901aa114-b123-4c45-9a67-abcde0000004",
        "started_at_offset": -60,
        "duration_minutes": 24,
        "intent": "private_event_buyout",
        "sentiment_score": Decimal("0.77"),
        "summary": "Confirmed 18-guest private dinner with onsite staff and large party credits.",
        "audio_reference": "s3://clay-pit-interactions/audio/2025/2025-09-10-jason-buyout.mp3",
        "transcript": [
            ("customer", "We're hosting investors-need a private room with curated curries and cocktails."),
            ("agent", "I'll design a family-style spread, assign two servers, and take $100 off for the event package."),
            ("customer", "Send the final BEO tonight so I can loop in facilities."),
        ],
        "confidence": [0.93, 0.97, 0.94],
    },
    {
        "order_index": 12,
        "interaction_id": "901aa115-b123-4c45-9a67-abcde0000005",
        "started_at_offset": -15,
        "duration_minutes": 10,
        "intent": "spice_guidance",
        "sentiment_score": Decimal("0.74"),
        "summary": "Guided Naveen to chef-special heat levels with backup cooling sides.",
        "audio_reference": "s3://clay-pit-interactions/audio/2025/2025-05-18-naveen-heat.mp3",
        "transcript": [
            ("customer", "Turn the vindaloo heat to eleven-I'm chasing the chef special."),
            ("agent", "You got it. I'll flag the kitchen for maximum heat and add cooling naan and gulab jamun."),
            ("customer", "Love it. Pair with two peacock cocktails and let's go."),
        ],
        "confidence": [0.93, 0.95, 0.94],
    },
    {
        "order_index": 16,
        "interaction_id": "901aa116-b123-4c45-9a67-abcde0000006",
        "started_at_offset": -75,
        "duration_minutes": 28,
        "intent": "milestone_party",
        "sentiment_score": Decimal("0.81"),
        "summary": "Planned Rahul's backyard birthday for 24 with full bar and buyout credit.",
        "audio_reference": "s3://clay-pit-interactions/audio/2025/2025-07-19-rahul-birthday.mp3",
        "transcript": [
            ("customer", "We're throwing a backyard birthday-need enough curry and cocktails for twenty-four."),
            ("agent", "I'll stage mixed protein curries, trays of naan, and batch cocktails-applying the private buyout credit."),
            ("customer", "Amazing. Include six vegetarian mains for my in-laws."),
        ],
        "confidence": [0.91, 0.96, 0.94],
    },
]

from math import floor

for entry in interaction_map:
    order = orders[entry["order_index"]]
    placed = datetime.fromisoformat(order["placed_at"].replace("Z", "+00:00"))
    started_at = placed + timedelta(minutes=entry["started_at_offset"])
    ended_at = started_at + timedelta(minutes=entry["duration_minutes"])
    interaction = {
        "interaction_id": entry["interaction_id"],
        "customer_id": order["customer_id"],
        "order_id": order["order_id"],
        "agent_persona_id": order["agent_persona_id"],
        "channel": "voice",
        "started_at": started_at.isoformat(),
        "ended_at": ended_at.isoformat(),
        "intent": entry["intent"],
        "sentiment_score": entry["sentiment_score"],
        "resolution_status": "resolved",
        "summary": entry["summary"],
        "audio_reference": entry["audio_reference"],
    }
    agent_interactions.append(interaction)
    transcript_entries = []
    for idx, turn in enumerate(entry["transcript"], start=1):
        transcript_entries.append({
            "transcript_id": str(uuid.uuid4()),
            "interaction_id": entry["interaction_id"],
            "turn_index": idx,
            "speaker": turn[0],
            "content": turn[1],
            "confidence": entry["confidence"][idx - 1],
        })
    interaction_transcripts.extend(transcript_entries)
    transcript_media.append({
        "media_id": str(uuid.uuid4()),
        "interaction_id": entry["interaction_id"],
        "storage_path": entry["audio_reference"],
        "media_type": "audio/mp3",
        "duration_seconds": entry["duration_minutes"] * 60,
        "is_transcoded": True,
    })

# Generate SQL
lines = []
lines.append("begin;")
lines.append("\n-- Reset existing data\n")
lines.append("truncate table public.transcript_media restart identity cascade;")
lines.append("truncate table public.interaction_transcripts restart identity cascade;")
lines.append("truncate table public.agent_interactions restart identity cascade;")
lines.append("truncate table public.customer_persona_overrides restart identity cascade;")
lines.append("truncate table public.premium_customers restart identity cascade;")
lines.append("truncate table public.customer_profiles restart identity cascade;")
lines.append("truncate table public.customer_segment_members restart identity cascade;")
lines.append("truncate table public.customer_segments restart identity cascade;")
lines.append("truncate table public.orders restart identity cascade;")
lines.append("truncate table public.order_items restart identity cascade;")
lines.append("truncate table public.menu_item_discounts restart identity cascade;")
lines.append("truncate table public.discounts restart identity cascade;")
lines.append("truncate table public.menu_items restart identity cascade;")
lines.append("truncate table public.menu_categories restart identity cascade;")
lines.append("truncate table public.agent_personas restart identity cascade;")
lines.append("truncate table public.customer_addresses restart identity cascade;")
lines.append("truncate table public.customers restart identity cascade;")

# Insert customers
lines.append("\n-- Customers\n")
for cust in customers:
    lines.append(
        "insert into public.customers (customer_id, full_name, email, phone, gender, date_of_birth, preferred_contact_channel) values ("
        f"{sql_str(cust['customer_id'])}, {sql_str(cust['full_name'])}, {sql_str(cust['email'])}, {sql_str(cust['phone'])}, {sql_str(cust['gender'])}, {sql_str(cust['date_of_birth'])}, {sql_str(cust['preferred_contact_channel'])});"
    )

# Addresses
lines.append("\n-- Customer addresses\n")
for addr in customer_addresses:
    latitude = f"{addr['latitude']:.6f}" if addr['latitude'] is not None else "NULL"
    longitude = f"{addr['longitude']:.6f}" if addr['longitude'] is not None else "NULL"
    lines.append(
        "insert into public.customer_addresses (address_id, customer_id, label, street, city, state, postal_code, country, latitude, longitude, is_default) values ("
        f"{sql_str(addr['address_id'])}, {sql_str(addr['customer_id'])}, {sql_str(addr['label'])}, {sql_str(addr['street'])}, {sql_str(addr['city'])}, {sql_str(addr['state'])}, {sql_str(addr['postal_code'])}, {sql_str(addr['country'])}, {latitude}, {longitude}, {'true' if addr['is_default'] else 'false'});"
    )

# Update primary addresses
lines.append("\n-- Update customers with default address ids\n")
for cust_id, addr_id in primary_address_updates.items():
    lines.append(
        f"update public.customers set primary_address_id = {sql_str(addr_id)} where customer_id = {sql_str(cust_id)};"
    )

# Agent personas
lines.append("\n-- Agent personas\n")
for persona in agent_personas:
    tone_json = sql_str(json.dumps(persona['tone_guidelines']))
    suggestion_json = sql_str(json.dumps(persona['suggestion_rules']))
    lines.append(
        "insert into public.agent_personas (agent_persona_id, name, description, tone_guidelines, suggestion_rules, default_channel) values ("
        f"{sql_str(persona['agent_persona_id'])}, {sql_str(persona['name'])}, {sql_str(persona['description'])}, {tone_json}::jsonb, {suggestion_json}::jsonb, {sql_str(persona['default_channel'])});"
    )

# Menu categories
lines.append("\n-- Menu categories\n")
for cat in menu_categories:
    lines.append(
        "insert into public.menu_categories (category_id, name, description, display_order, is_active) values ("
        f"{sql_str(cat['category_id'])}, {sql_str(cat['name'])}, {sql_str(cat['description'])}, {cat['display_order']}, {'true' if cat['is_active'] else 'false'});"
    )

# Menu items
lines.append("\n-- Menu items\n")
for item in menu_items:
    image = sql_str(item['image_url']) if item['image_url'] else "NULL"
    lines.append(
        "insert into public.menu_items (menu_item_id, category_id, name, description, is_vegetarian, is_vegan, is_gluten_free, spice_level, base_price, is_active, image_url, prep_time_minutes) values ("
        f"{sql_str(item['menu_item_id'])}, {sql_str(item['category_id'])}, {sql_str(item['name'])}, {sql_str(item['description'])}, {'true' if item['is_vegetarian'] else 'false'}, {'true' if item['is_vegan'] else 'false'}, {'true' if item['is_gluten_free'] else 'false'}, {sql_str(item['spice_level'])}, {decimal_str(item['base_price'])}, {'true' if item['is_active'] else 'false'}, {image}, {item['prep_time_minutes'] if item['prep_time_minutes'] is not None else 'NULL'});"
    )

# Customer segments
lines.append("\n-- Customer segments\n")
for seg in customer_segments:
    definition = sql_str(json.dumps(seg['definition']))
    lines.append(
        "insert into public.customer_segments (segment_id, name, definition, is_dynamic) values ("
        f"{sql_str(seg['segment_id'])}, {sql_str(seg['name'])}, {definition}::jsonb, {'true' if seg['is_dynamic'] else 'false'});"
    )

# Segment members
lines.append("\n-- Segment membership\n")
for member in customer_segment_members:
    exit_at = "NULL"
    lines.append(
        "insert into public.customer_segment_members (segment_id, customer_id, joined_at, exit_at) values ("
        f"{sql_str(member['segment_id'])}, {sql_str(member['customer_id'])}, {sql_str(member['joined_at'])}, {exit_at});"
    )

# Discounts
lines.append("\n-- Discounts\n")
for disc in discounts:
    lines.append(
        "insert into public.discounts (discount_id, name, discount_type, value, starts_at, segment_id, is_stackable, notes) values ("
        f"{sql_str(disc['discount_id'])}, {sql_str(disc['name'])}, {sql_str(disc['discount_type'])}, {decimal_str(disc['value'])}, {sql_str(disc['starts_at'])}, {sql_str(disc['segment_id'])}, {'true' if disc['is_stackable'] else 'false'}, {sql_str(disc['notes'])});"
    )

# Menu item discounts
lines.append("\n-- Menu item discount mapping\n")
for mid in menu_item_discounts:
    lines.append(
        "insert into public.menu_item_discounts (menu_item_id, discount_id, channel_scope) values ("
        f"{sql_str(mid['menu_item_id'])}, {sql_str(mid['discount_id'])}, {sql_str(mid['channel_scope'])});"
    )

# Customer profiles
lines.append("\n-- Customer profiles\n")
for profile in customer_profiles:
    allergies = sql_array(profile['allergies'])
    tags = sql_array(profile['crm_tags'])
    lines.append(
        "insert into public.customer_profiles (customer_id, dietary_restriction, spice_tolerance, allergies, favorite_cuisine_notes, language_preference, crm_tags, last_updated_by) values ("
        f"{sql_str(profile['customer_id'])}, {sql_str(profile['dietary_restriction'])}, {sql_str(profile['spice_tolerance'])}, {allergies}, {sql_str(profile['favorite_cuisine_notes'])}, {sql_str(profile['language_preference'])}, {tags}, {sql_str(profile['last_updated_by'])});"
    )

# Premium customers
lines.append("\n-- Premium customers\n")
for vip in premium_customers:
    concierge = sql_str(vip['concierge_notes']) if vip['concierge_notes'] else "NULL"
    lines.append(
        "insert into public.premium_customers (customer_id, qualifying_date, qualification_reason, ltv_percentile, sentiment_avg, concierge_notes) values ("
        f"{sql_str(vip['customer_id'])}, {sql_str(vip['qualifying_date'])}, {sql_str(vip['qualification_reason'])}, {decimal_str(vip['ltv_percentile'])}, {decimal_str(vip['sentiment_avg'])}, {concierge});"
    )

# Customer persona overrides
lines.append("\n-- Persona overrides\n")
for override in customer_persona_overrides:
    tone_json = sql_str(json.dumps(override['tone_overrides']))
    playbook_json = sql_str(json.dumps(override['playbook_overrides']))
    valid_to = sql_str(override['valid_to']) if override['valid_to'] else "NULL"
    last_reviewed = sql_str(override['last_reviewed_at']) if override['last_reviewed_at'] else "NULL"
    lines.append(
        "insert into public.customer_persona_overrides (customer_id, agent_persona_id, tone_overrides, playbook_overrides, valid_from, valid_to, last_reviewed_at) values ("
        f"{sql_str(override['customer_id'])}, {sql_str(override['agent_persona_id'])}, {tone_json}::jsonb, {playbook_json}::jsonb, {sql_str(override['valid_from'])}, {valid_to}, {last_reviewed});"
    )

# Orders
lines.append("\n-- Orders\n")
for order in orders:
    delivery_id = sql_str(order['delivery_address_id']) if order['delivery_address_id'] else "NULL"
    instructions = sql_str(order['delivery_instructions']) if order['delivery_instructions'] else "NULL"
    lines.append(
        "insert into public.orders (order_id, customer_id, placed_at, status, subtotal, tax, discount_total, tip, total, average_order_value_snapshot, fulfillment_type, delivery_address_id, delivery_instructions, origin_channel, agent_persona_id) values ("
        f"{sql_str(order['order_id'])}, {sql_str(order['customer_id'])}, {sql_str(order['placed_at'])}, {sql_str(order['status'])}, {decimal_str(order['subtotal'])}, {decimal_str(order['tax'])}, {decimal_str(order['discount_total'])}, {decimal_str(order['tip'])}, {decimal_str(order['total'])}, {decimal_str(order['average_order_value_snapshot'])}, {sql_str(order['fulfillment_type'])}, {delivery_id}, {instructions}, {sql_str(order['origin_channel'])}, {sql_str(order['agent_persona_id'])});"
    )

# Order items
lines.append("\n-- Order items\n")
for order in orders:
    for item in order['items']:
        special = sql_str(item['special_requests']) if item['special_requests'] else "NULL"
        lines.append(
            "insert into public.order_items (order_item_id, order_id, menu_item_id, quantity, unit_price, discount_applied, special_requests) values ("
            f"{sql_str(item['order_item_id'])}, {sql_str(order['order_id'])}, {sql_str(item['menu_item_id'])}, {item['quantity']}, {decimal_str(item['unit_price'])}, {decimal_str(item['discount_applied'])}, {special});"
        )

# Agent interactions
lines.append("\n-- Agent interactions\n")
for inter in agent_interactions:
    audio = sql_str(inter['audio_reference']) if inter['audio_reference'] else "NULL"
    lines.append(
        "insert into public.agent_interactions (interaction_id, customer_id, order_id, agent_persona_id, channel, started_at, ended_at, intent, sentiment_score, resolution_status, summary, audio_reference) values ("
        f"{sql_str(inter['interaction_id'])}, {sql_str(inter['customer_id'])}, {sql_str(inter['order_id'])}, {sql_str(inter['agent_persona_id'])}, {sql_str(inter['channel'])}, {sql_str(inter['started_at'])}, {sql_str(inter['ended_at'])}, {sql_str(inter['intent'])}, {decimal_str(inter['sentiment_score'])}, {sql_str('resolved')}, {sql_str(inter['summary'])}, {audio});"
    )

# Interaction transcripts
lines.append("\n-- Interaction transcripts\n")
for tr in interaction_transcripts:
    lines.append(
        "insert into public.interaction_transcripts (transcript_id, interaction_id, turn_index, speaker, content, confidence) values ("
        f"{sql_str(tr['transcript_id'])}, {sql_str(tr['interaction_id'])}, {tr['turn_index']}, {sql_str(tr['speaker'])}, {sql_str(tr['content'])}, {Decimal(str(tr['confidence'])):.2f});"
    )

# Transcript media
lines.append("\n-- Transcript media\n")
for media in transcript_media:
    lines.append(
        "insert into public.transcript_media (media_id, interaction_id, storage_path, media_type, duration_seconds, is_transcoded) values ("
        f"{sql_str(media['media_id'])}, {sql_str(media['interaction_id'])}, {sql_str(media['storage_path'])}, {sql_str(media['media_type'])}, {media['duration_seconds']}, {'true' if media['is_transcoded'] else 'false'});"
    )

lines.append("\n-- Refresh aggregated metrics\n")
lines.append("refresh materialized view public.customer_order_metrics;")
lines.append("commit;")

output = "\n".join(lines) + "\n"
with open("supabase/seed/clay_pit_seed.sql", "w") as f:
    f.write(output)

print("Seed script written to supabase/seed/clay_pit_seed.sql")
