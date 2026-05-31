#!/bin/bash
# Full SEO audit script for all blog posts
echo "======= FULL SEO AUDIT: ALL 40 BLOG POSTS ======="
echo ""

ISSUES=0
TOTAL=0

for f in blog/*.html; do
  [[ "$f" == "blog/index.html" ]] && continue
  SLUG=$(basename "$f" .html)
  TOTAL=$((TOTAL+1))
  ERRORS=""

  # 1. Check ld+json script count
  BP=$(grep -c '<script type="application/ld+json">' "$f")
  if [ "$BP" -ne 2 ]; then
    ERRORS="$ERRORS  ❌ Expected 2 ld+json scripts, found $BP\n"
  fi

  # 2. Check canonical
  CAN=$(grep -c 'rel="canonical"' "$f")
  if [ "$CAN" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing canonical tag\n"
  fi

  # 3. Check og:title
  OGT=$(grep -c 'og:title' "$f")
  if [ "$OGT" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing og:title\n"
  fi

  # 4. Check og:description
  OGD=$(grep -c 'og:description' "$f")
  if [ "$OGD" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing og:description\n"
  fi

  # 5. Check og:image
  OGI=$(grep -c 'og:image' "$f")
  if [ "$OGI" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing og:image\n"
  fi

  # 6. Check twitter:card
  TW=$(grep -c 'twitter:card' "$f")
  if [ "$TW" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing twitter:card\n"
  fi

  # 7. Check article:modified_time
  MT=$(grep -c 'article:modified_time' "$f")
  if [ "$MT" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing article:modified_time\n"
  fi

  # 8. Check GTM
  GTM=$(grep -c 'GTM-N8KD9MB7' "$f")
  if [ "$GTM" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing GTM snippet\n"
  fi

  # 9. Check related-reading
  RR=$(grep -c 'related-reading' "$f")
  if [ "$RR" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing related-reading section\n"
  fi

  # 10. Check meta description
  MD=$(grep -c 'name="description"' "$f")
  if [ "$MD" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing meta description\n"
  fi

  # 11. Check h1 tag
  H1=$(grep -c '<h1' "$f")
  if [ "$H1" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing h1 tag\n"
  fi

  # 12. Check sitemap entry
  SM=$(grep -c "$SLUG" public/sitemap.xml)
  if [ "$SM" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing from sitemap.xml\n"
  fi

  # 13. Check blog/index.html listing
  BL=$(grep -c "$SLUG" blog/index.html)
  if [ "$BL" -eq 0 ]; then
    ERRORS="$ERRORS  ❌ Missing from blog/index.html listing\n"
  fi

  if [ -n "$ERRORS" ]; then
    echo "⚠️  $SLUG:"
    printf "$ERRORS"
    ISSUES=$((ISSUES+1))
  fi
done

echo ""
echo "--- SUMMARY ---"
echo "Total blog posts audited: $TOTAL"
if [ "$ISSUES" -eq 0 ]; then
  echo "✅ ALL $TOTAL BLOG POSTS PASS EVERY CHECK (13 checks each)"
else
  echo "⚠️  $ISSUES out of $TOTAL posts have issues"
fi
