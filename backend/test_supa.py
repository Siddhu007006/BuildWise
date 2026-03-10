import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
print(f"URL: {url}")
print(f"KEY: {key[:15]}...{key[-10:]}")
supabase = create_client(url, key)
try:
    res = supabase.table("projects").select("*").execute()
    print("SUCCESS", res.data)
except Exception as e:
    print("ERROR:", str(e))
