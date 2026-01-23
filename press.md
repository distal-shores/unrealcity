---
layout: page
title: Press
permalink: /press/
---

<div class="press-page">

    {% assign press = site.data.press | sort: "date" | reverse %}

    <section class="press-intro">
        <p class="press-kicker">
          Press coverage, interviews, and announcements related to the festival and our artists.
        </p>

        <div class="press-actions">
            <!--
            <a class="press-action" href="/assets/UnrealCity-EPK.pdf">Download EPK</a>
            -->
            <a class="press-action" href="mailto:{{site.email}}">Press contact</a>
        </div>
    </section>

    {% assign featured = press | where: "featured", true %}
    {% if featured and featured.size > 0 %}
        <section class="press-featured">
            <h2>Highlights</h2>
    
            <div class="press-featured-grid">
                {% for item in featured %}
                    <article class="press-quote-card">
                        <blockquote>
                            “{{ item.quote }}”
                        </blockquote>
    
                        <div class="press-quote-meta">
                            <span class="press-outlet">{{ item.outlet }}</span>
                                <a class="press-title" href="{{ item.url }}" target="_blank" rel="noopener">
                                    {{ item.title }}
                                </a>
                            <time class="press-date" datetime="{{ item.date }}">
                                {{ item.date | date: "%b %-d, %Y" }}
                            </time>
                        </div>
                    </article>
                {% endfor %}
            </div>
        </section>
    {% endif %}

    <section class="press-archive">
        <h2>All coverage</h2>

        {% assign years = press | map: "date" | uniq %}
        {% assign current_year = "" %}

        {% for item in press %}
            {% assign year = item.date | date: "%Y" %}
            {% if year != current_year %}
                {% assign current_year = year %}
                <h3 class="press-year">{{ current_year }}</h3>
                <ul class="press-list">
            {% endif %}

                    <li class="press-item">
                        <div class="press-item-main">
                            <span class="press-outlet">{{ item.outlet }}</span>
                            <a class="press-title" href="{{ item.url }}" target="_blank" rel="noopener">
                                {{ item.title }}
                            </a>
                            {% if item.quote %}
                                <div class="press-quote-snippet">“{{ item.quote }}”</div>
                            {% endif %}
                        </div>

                        <time class="press-date" datetime="{{ item.date }}">
                            {{ item.date | date: "%b %-d, %Y" }}
                        </time>
                    </li>

                {% assign next_item = press[forloop.index] %}
                {% assign next_year = next_item.date | date: "%Y" %}
            {% if forloop.last or next_year != current_year %}
                </ul>
            {% endif %}
        {% endfor %}
    </section>
</div>