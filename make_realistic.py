import numpy as np
from PIL import Image
import os

def overlay_realistic(base_path, logo_path, out_path, logo_width, position):
    base = Image.open(base_path).convert("RGBA")
    logo = Image.open(logo_path).convert("RGBA")
    
    wpercent = (logo_width/float(logo.size[0]))
    hsize = int((float(logo.size[1])*float(wpercent)))
    logo = logo.resize((logo_width, hsize), Image.Resampling.LANCZOS)
    
    crop_box = (position[0], position[1], position[0]+logo_width, position[1]+hsize)
    hoodie_crop = base.crop(crop_box).convert("L")
    
    mean_brightness = np.mean(np.array(hoodie_crop))
    
    hoodie_np = np.array(hoodie_crop).astype(float)
    lighting_ratio = hoodie_np / (mean_brightness + 1e-5)
    
    lighting_ratio = (lighting_ratio - 1.0) * 1.5 + 1.0
    lighting_ratio = np.clip(lighting_ratio, 0.3, 1.5)
    
    logo_np = np.array(logo).astype(float)
    logo_rgb = logo_np[:, :, :3]
    logo_alpha = logo_np[:, :, 3:]
    
    lighting_ratio_3d = np.expand_dims(lighting_ratio, axis=-1)
    
    realistic_rgb = logo_rgb * lighting_ratio_3d
    realistic_rgb = np.clip(realistic_rgb, 0, 255)
    
    realistic_logo_np = np.concatenate([realistic_rgb, logo_alpha], axis=2).astype(np.uint8)
    realistic_logo = Image.fromarray(realistic_logo_np, "RGBA")
    
    base.alpha_composite(realistic_logo, position)
    base.convert("RGB").save(out_path)

logo_path = "public/logo_cashpot_new.png"
if not os.path.exists(logo_path):
    logo_path = "public/logo_cashpot.png"

white_hoodie = "/Users/eugeniucazmal/.gemini/antigravity-ide/brain/38f7544c-0a2f-40ef-babc-ccb36f843638/plain_white_hoodie_1781279855894.png"
red_hoodie = "/Users/eugeniucazmal/.gemini/antigravity-ide/brain/38f7544c-0a2f-40ef-babc-ccb36f843638/plain_red_hoodie_1781279865838.png"

os.makedirs("hoodies_realistic", exist_ok=True)

# Logo is now smaller (200px) and centered on the chest
# Image width is 1024, center is 512. 512 - (200/2) = 412
overlay_realistic(white_hoodie, logo_path, "hoodies_realistic/white_hoodie_final.png", 160, (432, 340))
overlay_realistic(red_hoodie, logo_path, "hoodies_realistic/red_hoodie_final.png", 160, (432, 360))

print("Done")
