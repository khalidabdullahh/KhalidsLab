#!/usr/bin/env python3
"""
Rebuild Posts Index Script
Author: Khalid Abdullah
Scans posts/*.json and compiles metadata into posts/posts-index.json & posts-index.json
"""
import glob
import json
import os

def build_index():
    post_files = sorted(glob.glob('posts/*.json'))
    entries = []
    
    # Priority order for pinned posts
    order_preference = [
        'gesture-volume-smart-on-screen-volume-slider-android',
        'aegis-focus-pro-unbreakable-discipline-launch',
        'aegis-focus-architectural-breakdown',
        'lumen-os-institutional-quant-terminal-architecture',
        'codeforge-mobile-android-ide-architecture',
        'gesture-volume-geometric-recognition-android-utility',
        'ares-adaptive-reasoning-execution-system-architecture',
        'freeaicv-careerhub-ats-engine-architecture'
    ]

    loaded = {}
    for pf in post_files:
        if 'posts-index' in pf:
            continue
        with open(pf, 'r', encoding='utf-8') as f:
            data = json.load(f)
            slug = data['slug']
            item = {
                'id': data.get('id', f'post-{slug}'),
                'slug': slug,
                'title': data['title'],
                'tagline': data.get('tagline', ''),
                'category': data.get('category', 'Engineering'),
                'categoryColor': data.get('categoryColor', 'cyan'),
                'date': data.get('date', '2026-10-10'),
                'readTime': data.get('readTime', '10 min read'),
                'author': data.get('author', 'Khalid Abdullah'),
                'tags': data.get('tags', []),
                'file': f'posts/{slug}.json',
                'published': data.get('published', True)
            }
            loaded[slug] = item

    for slug in order_preference:
        if slug in loaded:
            entries.append(loaded[slug])
            del loaded[slug]

    for remaining in loaded.values():
        entries.append(remaining)

    with open('posts/posts-index.json', 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2)

    with open('posts-index.json', 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2)

    print(f"Successfully compiled {len(entries)} posts to posts/posts-index.json and posts-index.json")

if __name__ == '__main__':
    build_index()
