Drop the JLOS logo file here as `jlos-logo.png` (or update the path in
`index.html` / `resources/css/layout.css` if you use a different name).

index.html references it as `resources/images/jlos-logo.png` with an
`onerror` fallback to the previous hotlinked jlos.go.ug logo, so the page
keeps working today and will automatically pick up the new file the moment
it's added here — no further code changes needed.
