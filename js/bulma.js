jQuery(document).ready(function ($) {

  var $toggle = $('#nav-toggle');
  var $menuLeft = $('#nav-menu-left');
  var $menuRight = $('#nav-menu-right');

  $toggle.click(function() {
    $(this).toggleClass('is-active');
    $menuLeft.toggleClass('is-active');
    $menuRight.toggleClass('is-active');
  });
});
