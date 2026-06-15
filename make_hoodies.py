from PIL import Image
import os

def overlay_logo(base_path, logo_path, out_path, logo_width, position):
    base = Image.open(base_path).convert("RGBA")
    logo = Image.open(logo_path).convert("RGBA")
    
    wpercent = (logo_width/float(logo.size[0]))
    hsize = int((float(logo.size[1])*float(wpercent)))
    logo = logo.resize((logo_width, hsize), Image.Resampling.LANCZOS)
    
    base.alpha_composite(logo, position)
    base.convert("RGB").save(out_path)

logo_path = "public/logo_cashpot_new.png"
if not os.path.exists(logo_path):
    logo_path = "public/logo_cashpot.png"

white_hoodie = "/Users/eugeniucazmal/.gemini/antigravity-ide/brain/38f7544c-0a2f-40ef-babc-ccb36f843638/plain_white_hoodie_1781279855894.png"
red_hoodie = "/Users/eugeniucazmal/.gemini/antigravity-ide/brain/38f7544c-0a2f-40ef-babc-ccb36f843638/plain_red_hoodie_1781279865838.png"

os.makedirs("hoodies", exist_ok=True)
overlay_logo(white_hoodie, logo_path, "hoodies/white_hoodie_perfect.png", 250, (387, 360))
overlay_logo(red_hoodie, logo_path, "hoodies/red_hoodie_perfect.png", 250, (387, 360))
print("Done")
