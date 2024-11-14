---
layout: page
title: Bands
permalink: /bands/
page_id: "bands"
wide: true
---

<div class="container">
    <div class="row gap-3" id="band-container">
        <!-- Display headliner bands first -->
        {% for band in site.bands %}
            {% if band.headliner %}
                <div class="band-card col-md-6 mb-4" style="background-image:url('/assets/img/band_photos/{{ band.img }}.jpg');">
                    <img class="band-frame" src="/assets/img/band_frame.png" />
                    <h2 class="band-name headliner">{{ band.name }}</h2>
                    <a href="{{ band.url }}" class="band-link"></a>
                </div>
            {% endif %}
        {% endfor %}

        <!-- Then display the remaining bands -->
        {% for band in site.bands %}
            {% unless band.headliner %}
                <div class="band-card col-md-6 mb-4" style="background-image:url('/assets/img/band_photos/{{ band.img }}.jpg');">
                    <img class="band-frame" src="/assets/img/band_frame.png" />
                    <h2 class="band-name">{{ band.name }}</h2>
                    <a href="{{ band.url }}" class="band-link"></a>
                </div>
            {% endunless %}
        {% endfor %}
    </div>
</div>