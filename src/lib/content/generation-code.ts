export const generationCode = `from PIL import Image, ImageDraw
import cv2
import hashlib
import numpy as np

VIDEO_FPS = 60

def random_generator(init_seed):
    if init_seed.startswith("0x"):
        init_seed = init_seed[2:]
    init_seed = bytes.fromhex(init_seed)
    seed = init_seed

    while True:
        m = hashlib.sha3_256()
        m.update(init_seed)
        m.update(seed)
        seed = m.digest()
        for b in seed:
            for i in range(8):
                yield (b >> i) & 1

def random_int(largest, gen):
    num = 0
    for _ in range(256):
        num = (num << 1) + next(gen)
    return num % largest

def create_media(file_name, seed, background_color):
    file_name += "_" + background_color
    gen = random_generator(seed)

    horizontal_steps = []
    vertical_steps = []

    vert = 1500
    target_size = (int(vert * 1.6), vert)

    x, y = 0, 0
    min_x, max_x, min_y, max_y = 0, 0, 0, 0
    while True:
        a, b = next(gen), next(gen)
        if (a, b) == (0, 0):
            x += 1
            horizontal_steps.append(1)
            vertical_steps.append(0)
        elif (a, b) == (0, 1):
            x -= 1
            horizontal_steps.append(-1)
            vertical_steps.append(0)
        elif (a, b) == (1, 0):
            y += 1
            horizontal_steps.append(0)
            vertical_steps.append(1)
        elif (a, b) == (1, 1):
            y -= 1
            horizontal_steps.append(0)
            vertical_steps.append(-1)

        min_x = min(min_x, x)
        max_x = max(max_x, x)
        min_y = min(min_y, y)
        max_y = max(max_y, y)

        x_range = max_x - min_x
        y_range = max_y - min_y

        longer_range = max(x_range, y_range)
        shorter_range = min(x_range, y_range)

        if longer_range >= target_size[0] or shorter_range >= target_size[1]:
            break

    return horizontal_steps, vertical_steps`;
