document.addEventListener("DOMContentLoaded", () => {
    const contentDiv = document.getElementById("report-content");
    const tocNav = document.getElementById("toc");

    // Decode Base64 markdown data safely into UTF-8
    let mdSource = "";
    try {
        if (typeof rawMdB64 !== "undefined") {
            const binaryString = atob(rawMdB64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            mdSource = new TextDecoder('utf-8').decode(bytes);
        } else {
            mdSource = "# حدث خطأ\nلم يتم العثور على محتوى التقرير. يرجى التأكد من إنشاء ملف data.js بشكل صحيح.";
        }
    } catch(e) {
        mdSource = "# حدث خطأ\nفشل في تحميل محتوى التقرير: " + e.message;
    }

    // Convert Markdown to HTML
    const rawHtml = marked.parse(mdSource);
    contentDiv.innerHTML = rawHtml;

    // Generate Table of Contents
    const headings = contentDiv.querySelectorAll("h2, h3");
    let tocHtml = "";
    
    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        
        const text = heading.textContent;
        const level = heading.tagName.toLowerCase(); 
        const className = level === "h3" ? "toc-link h3" : "toc-link";
        
        tocHtml += `<a href="#${id}" class="${className}" data-target="${id}">${text}</a>`;
    });

    tocNav.innerHTML = tocHtml || '<p style="color:var(--text-secondary)">لا توجد عناوين فرعية</p>';

    // Set up Smooth Scrolling for the TOC links
    const tocLinks = document.querySelectorAll(".toc-link");
    
    tocLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            const targetEl = document.getElementById(targetId);
            if(targetEl) {
                // Offset scroll slightly so sticky borders don't overlap headers
                const yOffset = -50; 
                const y = targetEl.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        });
    });

    // Intersection Observer to highlight the active section while scrolling
    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -70% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                tocLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("data-target") === id) {
                        link.classList.add("active");
                        // Scroll the TOC navigation smoothly so active item is visible
                        // Only do this on desktop layout to prevent auto-scrolling to the top on mobile
                        if (window.innerWidth > 1024) {
                            link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }
                });
            }
        });
    }, observerOptions);

    headings.forEach(heading => observer.observe(heading));

    // Fallback: If at the very top of the page, automatically highlight the first item
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100 && tocLinks.length > 0) {
            tocLinks.forEach(l => l.classList.remove("active"));
            tocLinks[0].classList.add("active");
        }
    }, {passive: true});

    // Highlight the first link by default
    if(tocLinks.length > 0) tocLinks[0].classList.add("active");

    // Theme Toggle Functionality
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    
    // SVG Icons
    const iconSun = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" class="sun-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    const iconMoon = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" class="moon-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

    // Load saved or system default theme
    const savedTheme = localStorage.getItem("report-theme") || "dark";
    body.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme = body.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        body.setAttribute("data-theme", newTheme);
        localStorage.setItem("report-theme", newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === "light") {
            themeToggle.innerHTML = iconMoon; // Show moon to switch to dark
        } else {
            themeToggle.innerHTML = iconSun; // Show sun to switch to light
        }
    }
});
