// Dims header (and menu) on medium screens and larger to remove unnecessary obstruction if not at page top, and brightens it on hover
function menuToggle() {
    if ($(window).outerWidth() > 768) {
        let isHovered = $("#page-header").is(":hover");

        if ($(window).scrollTop() === 0) {
            // If user is at page top, brighten header
            $("#page-header").css("opacity", "1");
        } else if (isHovered) {
            // If user is hovering over header, brighten header
            $("#page-header").css("opacity", "1");
        } else {
            // If user isn't at page top or hovering over header, dim header
            $("#page-header").css("opacity", "0.25");
        }
    } else {
        // In case window size is changed to medium size or smaller when header is dimmed, brighten header
        $("#page-header").css("opacity", "1");
    }
}

setInterval(menuToggle, 100);

// Dynamic timestamp in footer
const copyrightYears = $(".copyright-years").text();
const currYear = new Date().getFullYear();

if (copyrightYears != currYear) {
    $(".copyright-years").text(copyrightYears.concat(" - " + currYear));
}
