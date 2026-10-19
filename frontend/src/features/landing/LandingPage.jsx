"use client";

import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import LandingNavbar from "../../components/navbar/LandingNavbar";
import LoginForm from "../../features/auth/LoginForm";
import logo from "../../assets/logo.svg";

import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MicIcon from '@mui/icons-material/Mic';
import HeadsetIcon from '@mui/icons-material/Headset';
import Script from 'next/script';

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const runCustomJsLogic = ($) => {
    if (!$) return;
    /*

Template: Academic - Education, University and College Template
Author: potenzaglobalsolutions
Design and Developed by: potenzaglobalsolutions.com

NOTE: This file contains all scripts for the actual Template.

*/

/*================================================
[  Table of contents  ]
================================================

:: Preloader
:: Menu
:: Tooltip
:: Counter
:: Owl carousel
:: Swiper slider
:: Magnific Popup
:: Shuffle
:: Countdown
:: Search
:: Select2
:: Sticky
:: Progressbar
:: Back to top

======================================
[ End table content ]
======================================*/
//POTENZA var


  "use strict";
  window.POTENZA = {};

/*************************
  Predefined Variables
*************************/
  var $window = $(window),
    $document = $(document),
    $body = $('body'),
    $progressBar = $('.skill-bar'),
    $countdownTimer = $('.countdown'),
    $counter = $('.counter');
  //Check if function exists
  $.fn.exists = function () {
    return this.length > 0;
  };

/*************************
        Preloader
  *************************/
  POTENZA.preloader = function () {
    $("#load").fadeOut();
    $('#pre-loader').delay(0).fadeOut('slow');
  };

/*************************
      Menu
  *************************/
  POTENZA.dropdownmenu = function () {
    if ($('.navbar').exists()) {
      $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
        if (!$(this).next().hasClass('show')) {
          $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');
        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
          $('.dropdown-submenu .show').removeClass("show");
        });
        return false;
      });
    }
  };

/*************************
      Tooltip
*************************/
$('[data-toggle="tooltip"]').tooltip();
$('[data-toggle="popover"]').popover()

/*************************
       counter
*************************/
  POTENZA.counters = function () {
    var counter = jQuery(".counter");
    if (counter.length > 0) {
      $counter.each(function () {
        var $elem = $(this);
        $elem.appear(function () {
          $elem.find('.timer').countTo();
        });
      });
    }
  };

  /*************************
       Owl carousel
*************************/
  POTENZA.carousel = function () {
    var owlslider = jQuery("div.owl-carousel");
    if (owlslider.length > 0) {
      owlslider.each(function () {
        var $this = $(this),
          $items = ($this.data('items')) ? $this.data('items') : 1,
          $loop = ($this.attr('data-loop')) ? $this.data('loop') : true,
          $navdots = ($this.data('nav-dots')) ? $this.data('nav-dots') : false,
          $navarrow = ($this.data('nav-arrow')) ? $this.data('nav-arrow') : false,
          $autoplay = ($this.attr('data-autoplay')) ? $this.data('autoplay') : true,
          $autospeed = ($this.attr('data-autospeed')) ? $this.data('autospeed') : 5000,
          $smartspeed = ($this.attr('data-smartspeed')) ? $this.data('smartspeed') : 1000,
          $autohgt = ($this.data('autoheight')) ? $this.data('autoheight') : false,
          $space = ($this.attr('data-space')) ? $this.data('space') : 30,
          $animateOut = ($this.attr('data-animateOut')) ? $this.data('animateOut') : false;

        $(this).owlCarousel({
          loop: $loop,
          items: $items,
          responsive: {
            0: {
              items: $this.data('xx-items') ? $this.data('xx-items') : 1
            },
            480: {
              items: $this.data('xs-items') ? $this.data('xs-items') : 1
            },
            768: {
              items: $this.data('sm-items') ? $this.data('sm-items') : 2
            },
            980: {
              items: $this.data('md-items') ? $this.data('md-items') : 3
            },
            1200: {
              items: $items
            }
          },
          dots: $navdots,
          autoplayTimeout: $autospeed,
          smartSpeed: $smartspeed,
          autoHeight: $autohgt,
          margin: $space,
          nav: $navarrow,
          navText: ["<span class='prev-arrow'></span>Prev", "Next<span class='next-arrow'></span>"],
          autoplay: $autoplay,
          autoplayHoverPause: true
        });
      });
    }
  }

  /*************************
        Swiper slider
*************************/
  POTENZA.swiperAnimation = function () {
  var siperslider = jQuery(".swiper-container");
  if (siperslider.length > 0) {
    
    function triggerAnimations(swiper) {
      // Hide all animated elements inside the entire slider to reset them
      var allElements = swiper.el.querySelectorAll('[data-swiper-animation]');
      for(var i = 0; i < allElements.length; i++) {
         allElements[i].style.visibility = 'hidden';
         allElements[i].style.animationName = 'none';
         // remove the specific animation class so it can be re-added
         var animClass = allElements[i].getAttribute('data-swiper-animation');
         if(animClass) allElements[i].classList.remove(animClass);
      }
      
      // Animate elements inside the currently active slide (handles loop clones perfectly)
      var activeSlide = swiper.slides[swiper.activeIndex];
      var activeElements = activeSlide.querySelectorAll('[data-swiper-animation]');
      for(var j = 0; j < activeElements.length; j++) {
         var el = activeElements[j];
         var animation = el.getAttribute('data-swiper-animation');
         var delay = el.getAttribute('data-delay') || '0s';
         var duration = el.getAttribute('data-duration') || '1s';
         
         el.style.visibility = 'visible';
         el.style.animationDelay = delay;
         el.style.animationDuration = duration;
         
         // Trigger browser reflow to reliably restart CSS animations
         void el.offsetWidth;
         
         el.classList.add('animated', animation);
         el.style.animationName = animation;
      }
    }

    var swiper = new Swiper(".swiper-container", {
      init : false,
      direction: "horizontal",
      effect: "fade",
      speed: 1500, // Cinematic smooth crossfade transition
      fadeEffect: {
        crossFade: true
      },
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },

      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        type: 'bullets',
      },
      on: {
        init: function() {
          triggerAnimations(this);
        },
        slideChange: function() {
          triggerAnimations(this);
        }
      }
    });
    swiper.init();
  }
}

  /*************************
      Magnific Popup
  *************************/
  POTENZA.mediaPopups = function () {
    if ($(".popup-single").exists() || $(".popup-gallery").exists() || $('.modal-onload').exists() || $(".popup-youtube, .popup-vimeo, .popup-gmaps").exists()) {
      if ($(".popup-single").exists()) {
        $('.popup-single').magnificPopup({
          type: 'image'
        });
      }
      if ($(".popup-gallery").exists()) {
        $('.popup-gallery').magnificPopup({
          delegate: 'a.portfolio-img',
          type: 'image',
          tLoading: 'Loading image #%curr%...',
          mainClass: 'mfp-img-mobile',
          gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
          }
        });
      }
      if ($(".popup-youtube, .popup-vimeo, .popup-gmaps").exists()) {
        $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
          disableOn: 700,
          type: 'iframe',
          mainClass: 'mfp-fade',
          removalDelay: 160,
          preloader: false,
          fixedContentPos: false
        });
      }
      var $modal = $('.modal-onload');
      if ($modal.length > 0) {
        $('.popup-modal').magnificPopup({
          type: 'inline'
        });
        $(document).on('click', '.popup-modal-dismiss', function (e) {
          e.preventDefault();
          $.magnificPopup.close();
        });
        var elementTarget = $modal.attr('data-target');
        setTimeout(function () {
          $.magnificPopup.open({
            items: {
              src: elementTarget
            },
            type: "inline",
            mainClass: "mfp-no-margins mfp-fade",
            closeBtnInside: !0,
            fixedContentPos: !0,
            removalDelay: 500
          }, 0)
        }, 1500);
      }
    }
  }

  /*************************
      Shuffle
  *************************/
   POTENZA.shuffle = function () {
   if ($('.my-shuffle-container').exists()) {
    var Shuffle = window.Shuffle;
      var element = document.querySelector('.my-shuffle-container');
      var sizer = element.querySelector('.my-sizer-element');
      var shuffleInstance = new Shuffle(element, {
        itemSelector: '.grid-item',
        sizer: sizer, // could also be a selector: '.my-sizer-element'
        speed: 700,
        columnThreshold: 0
      });
      jQuery(document).ready(function(){
        jQuery(".btn-filter").on( 'click', function(){
          var data_group = jQuery(this).attr('data-group');
          if( data_group != 'all' ){
            shuffleInstance.filter([data_group]);
          } else {
            shuffleInstance.filter();
          }
        });
        $(".filters-group .btn-filter").on( 'click', function(){
            $(".filters-group .btn-filter").removeClass("active");
            $(this).addClass("active");
        });
    });
  }
 }

/*************************
      select2
*************************/
  POTENZA.select2 = function () {
    if ($('.basic-select').exists()) {
      var select = jQuery(".basic-select");
      if (select.length > 0) {
        $('.basic-select').select2({dropdownCssClass : 'bigdrop'});
      }

    }
  };

/*************************
    Countdown
*************************/
  POTENZA.countdownTimer = function () {
    if ($countdownTimer.exists()) {
      $countdownTimer.downCount({
        date: '12/25/2020 12:00:00', // Month/Date/Year HH:MM:SS
        offset: -4
      });
    }
  }

  /*************************
      Search
*************************/
POTENZA.searchbox = function () {
   if (jQuery('.search').exists()) {
      jQuery('.search-btn').on("click", function () {
         jQuery('.search').toggleClass("search-open");
           return false;
          });
       jQuery("html, body").on('click', function (e) {
        if (!jQuery(e.target).hasClass("not-click")) {

             jQuery('.search').removeClass("search-open");
         }
     });
    }
}

/*************************
      sticky
*************************/
POTENZA.isSticky = function () {

  $(window).on('scroll',function(event) {
        var scroll = $(window).scrollTop();
        if (scroll < 300) {
            $(".header-sticky").removeClass("sticky-top");
        }else{
            $(".header-sticky").addClass("sticky-top");
        }
    });
};

/*************************
     Back to top
*************************/
  POTENZA.goToTop = function () {
    var $goToTop = $('#back-to-top');
    $goToTop.hide();
    $window.scroll(function () {
      if ($window.scrollTop() > 100) $goToTop.fadeIn();
      else $goToTop.fadeOut();
    });
    $goToTop.on("click", function () {
      $('body,html').animate({
        scrollTop: 0
      }, 1000);
      return false;
    });
  }

    /*************************
          Progressbar
    *************************/
    POTENZA.progressBar = function () {
      if ($progressBar.exists()) {
          $progressBar.each(function (i, elem) {
              var $elem = $(this),
                  percent = $elem.attr('data-percent') || "100",
                  delay = $elem.attr('data-delay') || "100",
                  type = $elem.attr('data-type') || "%";

              if (!$elem.hasClass('progress-animated')) {
                  $elem.css({
                      'width': '0%'
                  });
              }
              var progressBarRun = function () {
                  $elem.animate({
                      'width': percent + '%'
                  }, 'easeInOutCirc').addClass('progress-animated');

                  $elem.delay(delay).append('<span class="progress-type animated fadeIn">' + type + '</span><span class="progress-number animated fadeIn">' + percent + '</span>');
              };
              $(elem).appear(function () {
                  setTimeout(function () {
                      progressBarRun();
                  }, delay);
              });
          });
        }
    };

  /****************************************************
       POTENZA Window load and functions
  ****************************************************/
  //Window load functions
  $window.on("load", function () {
    POTENZA.preloader(),
    POTENZA.shuffle(),
    POTENZA.progressBar();
  });

  //Document ready functions
  $document.ready(function () {
    POTENZA.counters(),
    POTENZA.dropdownmenu(),
    POTENZA.goToTop(),
    POTENZA.swiperAnimation(),
    POTENZA.countdownTimer(),
    POTENZA.select2(),
    POTENZA.mediaPopups(),
    POTENZA.searchbox(),
    POTENZA.isSticky(),
    POTENZA.carousel();
  });


    
    // Trigger window load functions manually if window is already loaded
    if (document.readyState === 'complete') {
       POTENZA.preloader();
       POTENZA.shuffle();
       POTENZA.progressBar();
    }
  };


  useEffect(() => {
    const scripts = [
      "/js/jquery-3.5.1.min.js",
      "/js/popper/popper.min.js",
      "/js/bootstrap/bootstrap.min.js",
      "/js/jquery.appear.js",
      "/js/counter/jquery.countTo.js",
      "/js/select2/select2.full.js",
      "/js/owl-carousel/owl.carousel.min.js",
      "/js/swiper/swiper.min.js",
      "/js/swiperanimation/SwiperAnimation.min.js",
      "/js/magnific-popup/jquery.magnific-popup.min.js",
      "/js/jarallax/jarallax.js",
      "/js/shuffle/shuffle.min.js"
    ];
    let i = 0;
    const loadNext = () => {
      if (i >= scripts.length) return;
      const s = document.createElement("script");
      s.src = scripts[i];
      s.async = false;
      
      s.onload = () => { 
        i++; 
        if (i === scripts.length) {
          runCustomJsLogic(window.jQuery);
        } else {
          loadNext(); 
        }
      };

      document.body.appendChild(s);
    };
    // Only load if jQuery isn't already loaded to prevent duplicate loading on re-renders
    
    if (!window.jQuery) {
      loadNext();
    } else {
      runCustomJsLogic(window.jQuery);
    }

  }, []);

  return (
    <>

      <style jsx global>{`
        /* Landing Page Specific Overrides */
        .form-control, .card, .events.bg-white, .team, .team-info, .course-item, .blog-post, .rounded, .border-radius { border-radius: 8px !important; }
        .card, .course-item, .blog-post { overflow: hidden !important; }
        .events.bg-white { border-radius: 4px !important; }
        .card, .events.bg-white, .course-item, .blog-post, .team-info, .course-form { box-shadow: none !important; border: 1px solid #e2e8f0 !important; transition: all 0.3s ease !important; }
        .btn { border-radius: 8px !important; padding: 12px 28px !important; font-size: 0.95rem !important; font-weight: 700 !important; }
        .events-img img, .team-img img, .blog-image img { border-radius: 8px !important; }
        .events-img { height: 100% !important; }
        .events-img img { height: 100% !important; min-height: 120px !important; object-fit: cover !important; }
        .coures-img img { border-radius: 8px 8px 0 0 !important; }
        .subscribe-form .form-control { border-radius: 8px !important; }
        
        .bg-primary { background-color: #0056b3 !important; }
        .bg-primary-gradient { background: linear-gradient(135deg, #0056b3 0%, #28a745 100%) !important; }
        .text-primary { color: #0056b3 !important; }
        .badge-primary { background-color: #0056b3 !important; color: #ffffff !important; }
        
        /* Force Swiper Pagination Dots to be Visible */
        .swiper-pagination { position: absolute !important; bottom: 80px !important; left: 0 !important; width: 100% !important; text-align: center !important; z-index: 9999 !important; }
        .swiper-pagination-bullet { width: 10px !important; height: 10px !important; background-color: #ffffff !important; opacity: 0.5 !important; display: inline-block !important; border-radius: 10px !important; margin: 0 6px !important; transition: all 0.3s ease !important; }
        .swiper-pagination-bullet-active { width: 28px !important; background-color: #5dde85 !important; opacity: 1 !important; }
        
        /* Force all slider headings to be perfectly centered */
        .swipeinner .row.text-center h1,
        .swipeinner .row.justify-content-center h1 { text-align: center !important; width: 100% !important; }
        
        /* Remove translate on hover and add border highlight globally */
        .card:hover, .course-item:hover, .blog-post:hover, .team-info:hover, .team:hover .team-info { transform: none !important; border: 1px solid #0056b3 !important; border-radius: 8px !important; }
        
        /* Block team card built-in hover animation */
        .team:hover .team-info { margin-top: -30px !important; background-color: #ffffff !important; }
        .team:hover .team-info .team-name, .team:hover .team-info p { color: inherit !important; }
        
        /* Keep social icons green on hover */
        .team .team-info ul li a:hover { background-color: #28a745 !important; color: #ffffff !important; }
        
        /* Remove hover effect entirely for Counseling Form and Events */
        .course-form:hover, .events.bg-white:hover { transform: none !important; border: 1px solid #e2e8f0 !important; }
      `}</style>

      <div className="main-wrapper">


        <LandingNavbar onLoginClick={() => setIsLoginOpen(true)} />

        <section className="banner position-ralative">
          <div id="main-slider" className="swiper-container vh-100">
            <div className="swiper-wrapper">

              <div className="swiper-slide align-items-center d-flex bg-overlay-black-40" style={{ "backgroundImage": "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000')", "backgroundSize": "cover", "backgroundPosition": "center center" }}>
                <div className="swipeinner container">
                  <div className="row justify-content-center text-center">
                    <div className="col-lg-10 col-md-12">
                      <div className="slider-1">
                        <div className="animated" data-swiper-animation="fadeInUp" data-duration="1s" data-delay="0.25s">
                          <h1 className="animated text-white mb-4" data-swiper-animation="fadeInUp" data-duration="1.5s" data-delay="0.25s" style={{ fontWeight: 800, lineHeight: '1.15' }}>Exceptional Education.<br /><span style={{ color: '#5dde85' }}>Exceptional Value.</span></h1>
                          <div className="animated text-white px-lg-5" data-swiper-animation="fadeInUp" data-duration="2.5s" data-delay="0.25s">
                            <p className="d-none d-sm-block lead" style={{ opacity: 0.95, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>The first thing to remember about success is that it is a process nothing more, nothing less. There is really no magic to it and it’s not reserved only for a select few people.</p>
                          </div>
                          <a href="#" className="animated4 btn mt-4 mr-1 mr-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s" style={{ background: '#ffffff', color: '#0056b3', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Discover More<span></span></a>
                          <a href="#" className="animated4 btn mt-4 ml-1 ml-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s" style={{ background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', color: '#ffffff', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Join Tarang<span></span></a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="swiper-slide align-items-center d-flex bg-overlay-black-40" style={{ "backgroundImage": "url('https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=2000')", "backgroundSize": "cover", "backgroundPosition": "center center" }}>
                <div className="swipeinner container">
                  <div className="row justify-content-center text-center">
                    <div className="col-lg-12 col-md-12">
                      <div className="slider-1">
                        <div className="animated" data-swiper-animation="fadeInUp" data-duration="1s" data-delay="0.25s">
                          <h1 className="animated text-white mb-4" data-swiper-animation="fadeInUp" data-duration="1s" data-delay="0.25s" style={{ fontWeight: 800, lineHeight: '1.15', textAlign: 'center' }}>The Education You Want.<br /><span style={{ color: '#5dde85' }}>The Attention You Deserve.</span></h1>
                          <div className="animated text-dark" data-swiper-animation="fadeInUp" data-duration="2.5s" data-delay="0.25s">
                            <p className="text-white d-none d-sm-block lead" style={{ opacity: 0.95, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>There are basically six key areas to higher achievement. Some people will tell you there are four while others may tell you there are eight.</p>
                          </div>
                          <a href="#" className="animated4 btn mt-4 mr-1 mr-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s" style={{ background: '#ffffff', color: '#0056b3', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Discover More<span></span></a>
                          <a href="#" className="animated4 btn mt-4 ml-1 ml-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s" style={{ background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', color: '#ffffff', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Join Tarang<span></span></a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="swiper-slide align-items-center d-flex bg-overlay-black-40" style={{ "backgroundImage": "url('https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2000')", "backgroundSize": "cover", "backgroundPosition": "center center" }}>
                <div className="swipeinner container">
                  <div className="row justify-content-center text-center">
                    <div className="col-lg-10 col-md-12">
                      <div className="slider-1">
                        <div className="animated" data-swiper-animation="fadeInUp" data-duration="1s" data-delay="0.25s">
                          <h1 className="animated text-white mb-4" data-swiper-animation="fadeInUp" data-duration="1.5s" data-delay="0.25s" style={{ fontWeight: 800, lineHeight: '1.15' }}>Empowering<br /><span style={{ color: '#5dde85' }}>Your Future.</span></h1>
                          <div className="animated text-white px-lg-5" data-swiper-animation="fadeInUp" data-duration="2.5s" data-delay="0.25s">
                            <p className="d-none d-sm-block lead" style={{ opacity: 0.95, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Join our platform to experience modern education.</p>
                          </div>
                          <a href="#" className="animated4 btn mt-4 mr-1 mr-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s" style={{ background: '#ffffff', color: '#0056b3', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Discover More<span></span></a>
                          <a href="#" className="animated4 btn mt-4 ml-1 ml-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s" style={{ background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', color: '#ffffff', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Join Tarang<span></span></a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="swiper-slide align-items-center d-flex bg-overlay-black-40" style={{ "backgroundImage": "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2000')", "backgroundSize": "cover", "backgroundPosition": "center center" }}>
                <div className="swipeinner container">
                  <div className="row justify-content-center text-center">
                    <div className="col-lg-10 col-md-12">
                      <div className="slider-1">
                        <div className="animated" data-swiper-animation="fadeInUp" data-duration="1s" data-delay="0.25s">
                          <h1 className="animated text-white mb-4" data-swiper-animation="fadeInUp" data-duration="1.5s" data-delay="0.25s" style={{ fontWeight: 800, lineHeight: '1.15' }}>Interactive<br /><span style={{ color: '#5dde85' }}>Learning Environment.</span></h1>
                          <div className="animated text-white px-lg-5" data-swiper-animation="fadeInUp" data-duration="2.5s" data-delay="0.25s">
                            <p className="d-none d-sm-block lead" style={{ opacity: 0.95, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Join our platform to experience modern education.</p>
                          </div>
                          <a href="#" className="animated4 btn mt-4 mr-1 mr-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s" style={{ background: '#ffffff', color: '#0056b3', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Discover More<span></span></a>
                          <a href="#" className="animated4 btn mt-4 ml-1 ml-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s" style={{ background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', color: '#ffffff', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Join Tarang<span></span></a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="swiper-pagination"></div>
          </div>
        </section>



        <section className="mt-md-n5 mt-4 position-relative z-index-9">
          <div className="container">
            <form className="course-form border-radius" style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: 'none',
                border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
              <div className="row" style={{ alignItems: 'flex-end' }}>
                <div className="col-md-4 mb-4 mb-md-0">
                  <div className="form-group mb-0">
                    <label style={{ marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "14px", display: "block" }}>Full Name</label>
                    <TextField
                        fullWidth
                        id="name"
                        placeholder="Your Name"
                        size="medium"
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px",
                                transition: "all 0.2s ease-in-out",
                                "& fieldset": { borderColor: "#e2e8f0" },
                                "&:hover fieldset": { borderColor: "#cbd5e1" },
                                "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                            },
                            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px", height: "auto" },
                        }}
                    />
                  </div>
                </div>
                <div className="col-md-4 mb-4 mb-md-0">
                  <div className="form-group mb-0">
                    <label style={{ marginBottom: "8px", fontWeight: 600, color: "#334155", fontSize: "14px", display: "block" }}>Email Address</label>
                    <TextField
                        fullWidth
                        id="email"
                        placeholder="Your Email"
                        size="medium"
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px",
                                transition: "all 0.2s ease-in-out",
                                "& fieldset": { borderColor: "#e2e8f0" },
                                "&:hover fieldset": { borderColor: "#cbd5e1" },
                                "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                            },
                            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px", height: "auto" },
                        }}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="course-serach">
                    <a className="btn btn-block" style={{ background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', border: 'none', color: '#ffffff', fontWeight: 600, borderRadius: '8px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} href="#">Book Counseling</a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>



        <section className="space-ptb">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0 pr-xl-6">
                <div className="section-title mb-4">
                  <h2 className="title">Personal Education, Extraordinary Success</h2>
                  <p className="lead mb-0">Commitment is something that comes from understanding that everything has its price and then having the willingness to pay that price.</p>
                </div>
                <p className="mb-4 mb-lg-5">The other virtues practice in succession by Franklin were silence, order, resolution, frugality, industry, sincerity, Justice, moderation, cleanliness, tranquility, chastity and humility. For the summary order he followed a little scheme of employing his time each day.</p>
                <a href="#" className="btn btn-round" style={{ background: '#28a745', color: '#ffffff', border: 'none', fontWeight: 700 }}>Read More</a>
              </div>
              <div className="col-lg-6 pr-lg-5">
                <div className="row">
                  <div className="col-sm-7">
                    <img className="img-fluid w-100 border-radius" src="/images/about/01.jpg" alt="" />
                  </div>
                  <div className="col-sm-5 mt-sm-5 mt-4">
                    <img className="img-fluid mb-sm-2 w-100 border-radius" src="/images/about/02.jpg" alt="" />
                    <div className="position-relative bg-overlay-black-50 border-radius overflow-hidden mt-4">
                      <img className="img-fluid border-radius" src="/images/about/03.jpg" alt="image" />
                      <a className="btn-animation position-center popup-youtube" href="https://www.youtube.com/watch?v=LgvseYYhqU0">
                        <PlayArrowIcon className="fas fa-play" style={{ fontSize: 'inherit' }} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        <section>
          <div className="container">
            <div className="row">
              <div className="col-sm-6 col-lg-3 mb-4 mb-lg-0">
                <div className="counter">
                  <div className="counter-icon d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: '70px', height: '70px', backgroundColor: '#f0f5fa', flexShrink: 0, marginRight: '25px' }}>
                    <GroupsIcon style={{ fontSize: '35px', color: '#0056b3' }} />
                  </div>
                  <div className="counter-content">
                    <span className="timer" data-to="1790" data-speed="10000">1790</span>
                    <label>Satisfied Students</label>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3 mb-4 mb-lg-0">
                <div className="counter">
                  <div className="counter-icon d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: '70px', height: '70px', backgroundColor: '#f0f5fa', flexShrink: 0, marginRight: '25px' }}>
                    <SchoolIcon style={{ fontSize: '35px', color: '#0056b3' }} />
                  </div>
                  <div className="counter-content align-self-center">
                    <span className="timer" data-to="245" data-speed="10000">245</span>
                    <label>Course Completed</label>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3 mb-4 mb-md-0">
                <div className="counter">
                  <div className="counter-icon d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: '70px', height: '70px', backgroundColor: '#f0f5fa', flexShrink: 0, marginRight: '25px' }}>
                    <AccountBalanceIcon style={{ fontSize: '35px', color: '#0056b3' }} />
                  </div>
                  <div className="counter-content">
                    <span className="timer" data-to="50" data-speed="10000">50</span>
                    <label>No of Institutes</label>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="counter">
                  <div className="counter-icon d-flex align-items-center justify-content-center rounded-circle shadow-sm" style={{ width: '70px', height: '70px', backgroundColor: '#f0f5fa', flexShrink: 0, marginRight: '25px' }}>
                    <CalendarMonthIcon style={{ fontSize: '35px', color: '#0056b3' }} />
                  </div>
                  <div className="counter-content">
                    <span className="timer" data-to="15" data-speed="10000">15</span>
                    <label>No of Years</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        <section className="space-ptb">
          <div className="container">
            <div className="row">
              <div className="col-sm-8">
                <div className="section-title">
                  <h2 className="title">Our Popular Courses</h2>
                </div>
              </div>
              <div className="col-sm-4 text-md-right mb-4 mb-sm-0">
                <a className="btn" href="#" style={{ background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', color: '#ffffff', border: 'none', fontWeight: 700 }}>All Courses</a>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="filters-group mb-lg-4">
                  <button className="btn-filter  active" data-group="all">All</button>
                  <button className="btn-filter" data-group="branding">Courses</button>
                  <button className="btn-filter" data-group="web">Events</button>
                  <button className="btn-filter" data-group="photography">Students</button>
                  <button className="btn-filter" data-group="advertising">Teachers</button>
                </div>
                <div className="row">

                  <div className="col-md-4 mb-4">
                    <div className="course-item">
                      <div className="coures-img">
                        <img className="img-fluid" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800" alt="" />
                        <div className="course-tag">
                          <a href="#">Business</a>
                        </div>
                      </div>
                      <div className="course-conten">
                        <a href="#" className="course-author d-flex align-items-center mb-3">
                          <img className="avatar img-fluid" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400" alt="" />
                          <span className="author-name">Alice Williams</span>
                        </a>
                        <h5 className="mb-3">
                          <a href="course-detail.html">Aeronautical & Manufacturing Engineering</a>
                        </h5>
                        <div className="course-rating mb-3 pb-3 border-bottom">
                          <div className="review-rating">
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star" style={{ fontSize: 'inherit' }} />
                          </div>
                        </div>
                        <div className="course-meta">
                          <ul className="list-unstyled mb-0">
                            <li><PersonIcon className="fa fa-user pr-2" style={{ fontSize: 'inherit' }} />12 students</li>
                            <li><MenuBookIcon className="fa fa-book-open pr-2" style={{ fontSize: 'inherit' }} />08 lessons</li>
                            <li className="price"><span>$100</span> $50</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>



                  <div className="col-md-4 mb-4">
                    <div className="course-item">
                      <div className="coures-img">
                        <img className="img-fluid" src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=800" alt="" />
                        <div className="course-tag">
                          <a href="#">Politics</a>
                        </div>
                      </div>
                      <div className="course-conten">
                        <a href="#" className="course-author d-flex align-items-center mb-3">
                          <img className="avatar img-fluid" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400" alt="" />
                          <span className="author-name">Mellissa Doe</span>
                        </a>
                        <h5 className="mb-3">
                          <a href="course-detail.html">Business & Management Studies</a>
                        </h5>
                        <div className="course-rating mb-3 pb-3 border-bottom">
                          <div className="review-rating">
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star" style={{ fontSize: 'inherit' }} />
                          </div>
                        </div>
                        <div className="course-meta">
                          <ul className="list-unstyled mb-0">
                            <li><PersonIcon className="fa fa-user pr-2" style={{ fontSize: 'inherit' }} />08 students</li>
                            <li><MenuBookIcon className="fa fa-book-open pr-2" style={{ fontSize: 'inherit' }} />04 lessons</li>
                            <li className="price"><span>$80</span> $40</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>



                  <div className="col-md-4 mb-4">
                    <div className="course-item">
                      <div className="coures-img">
                        <img className="img-fluid" src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800" alt="" />
                        <div className="course-tag">
                          <a href="#">Psychology</a>
                        </div>
                      </div>
                      <div className="course-conten">
                        <a href="#" className="course-author d-flex align-items-center mb-3">
                          <img className="avatar img-fluid" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400" alt="" />
                          <span className="author-name">Paul Flavius</span>
                        </a>
                        <h5 className="mb-3">
                          <a href="course-detail.html">History of Art, Architecture & Design</a>
                        </h5>
                        <div className="course-rating mb-3 pb-3 border-bottom">
                          <div className="review-rating">
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star" style={{ fontSize: 'inherit' }} />
                          </div>
                        </div>
                        <div className="course-meta">
                          <ul className="list-unstyled mb-0">
                            <li><PersonIcon className="fa fa-user pr-2" style={{ fontSize: 'inherit' }} />16 students</li>
                            <li><MenuBookIcon className="fa fa-book-open pr-2" style={{ fontSize: 'inherit' }} />10 lessons</li>
                            <li className="price"><span>$150</span> $80</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>



                  <div className="col-md-4 mb-4">
                    <div className="course-item">
                      <div className="coures-img">
                        <img className="img-fluid" src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800" alt="" />
                        <div className="course-tag">
                          <a href="#">Medicine</a>
                        </div>
                      </div>
                      <div className="course-conten">
                        <a href="#" className="course-author d-flex align-items-center mb-3">
                          <img className="avatar img-fluid" src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400" alt="" />
                          <span className="author-name">Felica Queen</span>
                        </a>
                        <h5 className="mb-3">
                          <a href="course-detail.html">Communication & Media Studies</a>
                        </h5>
                        <div className="course-rating mb-3 pb-3 border-bottom">
                          <div className="review-rating">
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star" style={{ fontSize: 'inherit' }} />
                          </div>
                        </div>
                        <div className="course-meta">
                          <ul className="list-unstyled mb-0">
                            <li><PersonIcon className="fa fa-user pr-2" style={{ fontSize: 'inherit' }} />21 students</li>
                            <li><MenuBookIcon className="fa fa-book-open pr-2" style={{ fontSize: 'inherit' }} />09 lessons</li>
                            <li className="price"><span>$180</span> $90</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>



                  <div className="col-md-4 mb-4">
                    <div className="course-item">
                      <div className="coures-img">
                        <img className="img-fluid" src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800" alt="" />
                        <div className="course-tag">
                          <a href="#">Architecture</a>
                        </div>
                      </div>
                      <div className="course-conten">
                        <a href="#" className="course-author d-flex align-items-center mb-3">
                          <img className="avatar img-fluid" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400" alt="" />
                          <span className="author-name">Michael Bean</span>
                        </a>
                        <h5 className="mb-3">
                          <a href="course-detail.html">Geography & Environmental Science</a>
                        </h5>
                        <div className="course-rating mb-3 pb-3 border-bottom">
                          <div className="review-rating">
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star" style={{ fontSize: 'inherit' }} />
                          </div>
                        </div>
                        <div className="course-meta">
                          <ul className="list-unstyled mb-0">
                            <li><PersonIcon className="fa fa-user pr-2" style={{ fontSize: 'inherit' }} />25 students</li>
                            <li><MenuBookIcon className="fa fa-book-open pr-2" style={{ fontSize: 'inherit' }} />15 lessons</li>
                            <li className="price"><span>$300</span> $200</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>



                  <div className="col-md-4 mb-4">
                    <div className="course-item">
                      <div className="coures-img">
                        <img className="img-fluid" src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800" alt="" />
                        <div className="course-tag">
                          <a href="#">Biological</a>
                        </div>
                      </div>
                      <div className="course-conten">
                        <a href="#" className="course-author d-flex align-items-center mb-3">
                          <img className="avatar img-fluid" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400" alt="" />
                          <span className="author-name">Sara Lisbon</span>
                        </a>
                        <h5 className="mb-3">
                          <a href="course-detail.html">Electrical & Electronic Engineering</a>
                        </h5>
                        <div className="course-rating mb-3 pb-3 border-bottom">
                          <div className="review-rating">
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star text-warning" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star" style={{ fontSize: 'inherit' }} />
                            <StarIcon className="fas fa-star" style={{ fontSize: 'inherit' }} />
                          </div>
                        </div>
                        <div className="course-meta">
                          <ul className="list-unstyled mb-0">
                            <li><PersonIcon className="fa fa-user pr-2" style={{ fontSize: 'inherit' }} />35 students</li>
                            <li><MenuBookIcon className="fa fa-book-open pr-2" style={{ fontSize: 'inherit' }} />17 lessons</li>
                            <li className="price"><span>$500</span> $280</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>



        <section className="bg-dark">
          <div className="container-fluid">
            <div className="row no-guuters">
              <div className="col-lg-5 bg-holder d-none d-lg-block" style={{ "backgroundImage": "url('/images/bg/06.jpg')" }}>
              </div>
              <div className="col-lg-7 px-4 px-md-5 px-lg-6 py-6 px-lg-6 bg-primary">
                <div className="section-title">
                  <h2 className="title">Why Choose Us</h2>
                  <p className="mb-0">Let success motivate you. Find a picture of what epitomizes success to you and then pull it out when you are in need of motivation.</p>
                </div>
                <div className="media">
                  <LibraryBooksIcon className="mr-3 text-white border border-white border-radius p-3 mb-0 font-weight-normal" style={{ fontSize: '70px' }} />
                  <div className="media-body">
                    <h5 className="mt-0 mb-3">Multidisciplinary study programs</h5>
                    <p className="text-white mb-0">For the summary order he followed a little scheme of employing his time each day. From five to seven each morning he spent in bodily personal attention,</p>
                  </div>
                </div>
                <span className="border-bottom d-block my-5 border-light"></span>
                <div className="media">
                  <SchoolIcon className="mr-3 text-white border border-white border-radius p-3 mb-0 font-weight-normal" style={{ fontSize: '70px' }} />
                  <div className="media-body">
                    <h5 className="mt-0 mb-3">International study programs</h5>
                    <p className="text-white mb-0">saying a short prayer, thinking over the day’s business and resolutions, studying and eating breakfast. From eight till twelve he worked at his trade.</p>
                  </div>
                </div>
                <span className="border-bottom d-block my-5 border-light"></span>
                <div className="media">
                  <GroupsIcon className="mr-3 text-white border border-white border-radius p-3 mb-0 font-weight-normal" style={{ fontSize: '70px' }} />
                  <div className="media-body">
                    <h5 className="mt-0 mb-3">Highly qualified teaching staff</h5>
                    <p className="text-white mb-0">From twelve to one he read or overlooked his accounts and dined. From two to five he worked at his trade. The rest of the evening music, or diversion of some sort.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        <section className="space-ptb">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-md-7">
                    <div className="section-title">
                      <h2 className="title">Latest Events</h2>
                      <p className="mb-0">Success isn’t really that difficult. There is a significant portion of the population</p>
                    </div>
                  </div>
                  <div className="col-md-5 text-md-right mb-4 mb-md-0">
                    <a className="btn btn-round" href="#" style={{ background: '#0056b3', color: '#ffffff', border: 'none', fontWeight: 700 }}>View All</a>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="events">
                      <div className="row">
                        <div className="col-12">
                          <div className="events border p-4 bg-white" style={{ borderRadius: '8px' }}>
                            <div className="row">
                              <div className="col-lg-3">
                                <div className="events-img mb-4 mb-lg-0">
                                  <img className="img-fluid border-0" style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '8px' }} src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800" alt="" />
                                </div>
                              </div>
                              <div className="col-lg-6 align-self-center">
                                <div className="events-content">
                                  <div className="events-tag mb-3">
                                    <a href="#" className="badge badge-primary px-3 py-2" style={{ borderRadius: '8px' }}>Art Competition</a>
                                  </div>
                                  <a href="event-detail.html" className="text-dark h4 font-weight-bold">Young leaders in tech policy fellowship</a>
                                  <div className="events-meta my-3">
                                    <ul className="list-unstyled mb-0 d-flex text-muted">
                                      <li className="mr-3"><a href="#" className="text-muted"><CalendarMonthIcon className="pr-1" style={{ fontSize: '20px', color: '#28a745' }} /> 5 Oct, 2020</a></li>
                                      <li><a href="#" className="text-muted"><AccessTimeIcon className="pr-1" style={{ fontSize: '20px', color: '#28a745' }} />  9:00 AM - 11:00 AM</a></li>
                                    </ul>
                                  </div>
                                  <p className="text-secondary mb-lg-0">Franklin’s extraordinary success in life and politics can be attributed to his perseverance to overcome his personal liabilities, and his desire to constantly become better.</p>
                                </div>
                              </div>
                              <div className="col-lg-3 align-self-center text-lg-right text-left">
                                <a className="btn" href="#" style={{ background: '#0056b3', color: '#ffffff', border: 'none', fontWeight: 700, padding: '10px 28px', fontSize: '0.95rem', borderRadius: '8px' }}>Join Event</a>
                              </div>
                            </div>
                          </div>
                          <div className="events border mt-4 p-4 bg-white" style={{ borderRadius: '8px' }}>
                            <div className="row">
                              <div className="col-lg-3">
                                <div className="events-img mb-4 mb-lg-0">
                                  <img className="img-fluid border-0" style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '8px' }} src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800" alt="" />
                                </div>
                              </div>
                              <div className="col-lg-6 align-self-center">
                                <div className="events-content">
                                  <div className="events-tag mb-3">
                                    <a href="#" className="badge badge-primary px-3 py-2" style={{ borderRadius: '8px' }}>Architecture Events</a>
                                  </div>
                                  <a href="event-detail.html" className="text-dark h4 font-weight-bold">Expert panel- careers in tech policy</a>
                                  <div className="events-meta my-3">
                                    <ul className="list-unstyled mb-0 d-flex text-muted">
                                      <li className="mr-3"><a href="#" className="text-muted"><CalendarMonthIcon className="pr-1" style={{ fontSize: '20px', color: '#28a745' }} /> 05 Nov, 2020</a></li>
                                      <li><a href="#" className="text-muted"><AccessTimeIcon className="pr-1" style={{ fontSize: '20px', color: '#28a745' }} />  2:00 PM - 4:00 PM</a></li>
                                    </ul>
                                  </div>
                                  <p className="text-secondary mb-lg-0">Next time you really want to achieve something, take time to focus on your own personal journal. What is your temptation that is standing in your way to greatness?</p>
                                </div>
                              </div>
                              <div className="col-lg-3 align-self-center text-lg-right text-left">
                                <a className="btn" href="#" style={{ background: '#0056b3', color: '#ffffff', border: 'none', fontWeight: 700, padding: '10px 28px', fontSize: '0.95rem', borderRadius: '8px' }}>Join Event</a>
                              </div>
                            </div>
                          </div>
                          <div className="events border mt-4 p-4 bg-white" style={{ borderRadius: '8px' }}>
                            <div className="row">
                              <div className="col-lg-3">
                                <div className="events-img mb-4 mb-lg-0">
                                  <img className="img-fluid border-0" style={{ height: '120px', width: '100%', objectFit: 'cover', borderRadius: '8px' }} src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800" alt="" />
                                </div>
                              </div>
                              <div className="col-lg-6 align-self-center">
                                <div className="events-content">
                                  <div className="events-tag mb-3">
                                    <a href="#" className="badge badge-primary px-3 py-2" style={{ borderRadius: '8px' }}>Medicine Events</a>
                                  </div>
                                  <a href="event-detail.html" className="text-dark h4 font-weight-bold">Health and life expectancy</a>
                                  <div className="events-meta my-3">
                                    <ul className="list-unstyled mb-0 d-flex text-muted">
                                      <li className="mr-3"><a href="#" className="text-muted"><CalendarMonthIcon className="pr-1" style={{ fontSize: '20px', color: '#28a745' }} /> 27 Nov, 2020</a></li>
                                      <li><a href="#" className="text-muted"><AccessTimeIcon className="pr-1" style={{ fontSize: '20px', color: '#28a745' }} />  4:00 PM - 6:00 PM</a></li>
                                    </ul>
                                  </div>
                                  <p className="text-secondary mb-lg-0">Get yourself nice and relaxed and settled. Concentrate on your breathing, engage in the moment and spend some time being still, quiet and drift inside of your own mind.</p>
                                </div>
                              </div>
                              <div className="col-lg-3 align-self-center text-lg-right text-left">
                                <a className="btn" href="#" style={{ background: '#0056b3', color: '#ffffff', border: 'none', fontWeight: 700, padding: '10px 28px', fontSize: '0.95rem', borderRadius: '8px' }}>Join Event</a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        <section className="space-ptb bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-md-10 text-center">

                <div className="section-title">
                  <h2>Meet Our Team</h2>
                  <p>Meet the outstanding performers in our industry-award-winning team of professionals</p>
                </div>

              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 col-md-4 col-sm-6 mb-4 mb-md-0">

                <div className="team">
                  <div className="team-img">
                    <img className="img-fluid rounded" style={{ height: '400px', width: '100%', objectFit: 'cover' }} src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400" alt="" />
                  </div>
                  <div className="team-info">
                    <a href="teachers-single.html" className="team-name">Mellissa Doe</a>
                    <p className="team-leader">Team Leader</p>
                    <ul className="list-unstyled">
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><FacebookIcon className="fab fa-facebook-f" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><TwitterIcon className="fab fa-twitter" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><LinkedInIcon className="fab fa-linkedin-in" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><InstagramIcon className="fab fa-instagram" style={{ fontSize: 'inherit' }} /></a></li>
                    </ul>
                  </div>
                </div>

              </div>
              <div className="col-lg-4 col-md-4 col-sm-6 mb-4 mb-md-0">

                <div className="team">
                  <div className="team-img">
                    <img className="img-fluid rounded" style={{ height: '400px', width: '100%', objectFit: 'cover' }} src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400" alt="" />
                  </div>
                  <div className="team-info">
                    <a href="teachers-single.html" className="team-name">Ora Bryan</a>
                    <p className="team-leader">Illustration</p>
                    <ul className="list-unstyled">
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><FacebookIcon className="fab fa-facebook-f" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><TwitterIcon className="fab fa-twitter" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><LinkedInIcon className="fab fa-linkedin-in" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><InstagramIcon className="fab fa-instagram" style={{ fontSize: 'inherit' }} /></a></li>
                    </ul>
                  </div>
                </div>

              </div>
              <div className="col-lg-4 col-md-4 col-sm-6">

                <div className="team">
                  <div className="team-img">
                    <img className="img-fluid rounded" style={{ height: '400px', width: '100%', objectFit: 'cover' }} src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400" alt="" />
                  </div>
                  <div className="team-info">
                    <a href="teachers-single.html" className="team-name">Gwen Bass</a>
                    <p className="team-leader">Sales and Marketing</p>
                    <ul className="list-unstyled">
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><FacebookIcon className="fab fa-facebook-f" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><TwitterIcon className="fab fa-twitter" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><LinkedInIcon className="fab fa-linkedin-in" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#" style={{ backgroundColor: '#28a745' }}><InstagramIcon className="fab fa-instagram" style={{ fontSize: 'inherit' }} /></a></li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>



        <section className="space-ptb position-relative">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7 col-md-10 text-center">

                <div className="section-title">
                  <h2 className="title">Latest Articles</h2>
                  <p>Check out our latest blog posts, articles, client success stories and essential announcement</p>
                </div>

              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 col-md-12 mb-0">

                <div className="blog mb-4 mb-lg-0">

                  <div className="blog-image">
                    <img className="img-fluid border-radius" src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800" alt="" />
                  </div>

                  <div className="blog-content pt-4 border-0">
                    <h5 className="blog-title mb-3"><a href="blog-detail.html">The problem with the push for more college degrees</a></h5>
                    <div className="blog-meta mb-0">
                      <ul className="list-unstyled mb-0 d-flex">
                        <li className="mr-3"><a href="#"><CalendarMonthIcon className="fas fa-calendar-alt pr-1" style={{ fontSize: 'inherit' }} /> 15 Oct, 2020</a></li>
                        <li><a href="#"><AccessTimeIcon className="fas fa-clock pr-1" style={{ fontSize: 'inherit' }} />  10:00 AM - 12:00 PM</a></li>
                      </ul>
                    </div>
                    <p className="mt-3 mb-0">Imagine reaching deep inside you for all the strength and wisdom that you need to make this decision today.</p>
                  </div>
                </div>

              </div>
              <div className="col-lg-6 col-md-12 mb-0">

                <div className="blog d-md-flex border-bottom mb-4 pb-4">

                  <div className="blog-image mr-0 mr-sm-3">
                    <img className="img-fluid border-radius" src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=800" alt="" />
                  </div>

                  <div className="blog-content pt-4 pt-md-0 border-0">
                    <h5 className="blog-title mb-3"><a href="blog-detail.html">Colleges with the most hispanic students</a></h5>
                    <div className="blog-meta mb-0">
                      <ul className="list-unstyled mb-0 d-flex">
                        <li className="mr-3"><a href="#"><CalendarMonthIcon className="fas fa-calendar-alt pr-1" style={{ fontSize: 'inherit' }} /> 20 Sept, 2020</a></li>
                        <li><a href="#"><AccessTimeIcon className="fas fa-clock pr-1" style={{ fontSize: 'inherit' }} />  12:00 PM - 3:00 PM</a></li>
                      </ul>
                    </div>
                  </div>
                </div>


                <div className="blog d-md-flex border-bottom mb-4 pb-4">

                  <div className="blog-image mr-0 mr-sm-3">
                    <img className="img-fluid border-radius" src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800" alt="" />
                  </div>

                  <div className="blog-content pt-4 pt-md-0 border-0">
                    <h5 className="blog-title mb-3"><a href="blog-detail.html">Get a job, internship during COVID-19</a></h5>
                    <div className="blog-meta mb-0">
                      <ul className="list-unstyled mb-0 d-flex">
                        <li className="mr-3"><a href="#"><CalendarMonthIcon className="fas fa-calendar-alt pr-1" style={{ fontSize: 'inherit' }} /> 05 Nov, 2020</a></li>
                        <li><a href="#"><AccessTimeIcon className="fas fa-clock pr-1" style={{ fontSize: 'inherit' }} />  2:00 PM - 4:00 PM</a></li>
                      </ul>
                    </div>
                  </div>
                </div>


                <div className="blog d-md-flex">

                  <div className="blog-image mr-0 mr-sm-3">
                    <img className="img-fluid border-radius" src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800" alt="" />
                  </div>

                  <div className="blog-content pt-4 pt-md-0 border-0">
                    <h5 className="blog-title mb-3"><a href="blog-detail.html">Why student loan default rate matters</a></h5>
                    <div className="blog-meta mb-0">
                      <ul className="list-unstyled mb-0 d-flex">
                        <li className="mr-3"><a href="#"><CalendarMonthIcon className="fas fa-calendar-alt pr-1" style={{ fontSize: 'inherit' }} /> 27 Nov, 2020</a></li>
                        <li><a href="#"><AccessTimeIcon className="fas fa-clock pr-1" style={{ fontSize: 'inherit' }} />  4:00 PM - 6:00 PM</a></li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>







        <div className="bg-holder" style={{ backgroundImage: "url('/images/bg/06.jpg')", backgroundSize: "cover", backgroundPosition: "center center" }}>
          <section className="space-ptb mb-0" style={{ zIndex: 2, background: 'linear-gradient(135deg, rgba(0, 86, 179, 0.88) 0%, rgba(40, 167, 69, 0.88) 100%)' }}>
          <div className="container pb-5">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="text-white d-block mb-4 h6 font-weight-normal">Are you ready to start your journey with us?</span>
                <h2 className="text-white mb-4 display-7">Education for Individual and Social Responsibility</h2>
                <a className="btn mr-sm-3 mt-3" href="#" style={{ background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', color: '#ffffff', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Become A Student</a>
                <a className="btn mt-3" href="#" style={{ background: '#ffffff', color: '#0056b3', border: 'none', fontWeight: 700, height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Discover More</a>
              </div>
            </div>
          </div>
            <div className="w-100" style={{ position: 'absolute', bottom: 0, transform: 'translateY(50%)', zIndex: 9 }}>
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-10">
                    <div className="p-5 bg-primary-gradient border-radius">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="row justify-content-between">
                            <div className="col-lg-7 col-md-8 align-self-center mb-4 mb-md-0">
                              <h2 className="text-white">Subscribe</h2>
                              <p className="mb-0 text-white">Now go push your own limits and succeed!</p>
                            </div>
                            <div className="col-lg-5 col-md-4 justify-content-end align-self-center">
                              <form action="#" className="d-flex flex-column flex-sm-row" style={{ gap: '16px', width: '100%' }}>
                                <TextField
                                    className="flex-grow-1"
                                    placeholder="Enter your email"
                                    type="email"
                                    size="medium"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: "#f8fafc",
                                            borderRadius: "8px",
                                            transition: "all 0.2s ease-in-out",
                                            "& fieldset": { borderColor: "#e2e8f0" },
                                            "&:hover fieldset": { borderColor: "#cbd5e1" },
                                            "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                                        },
                                        "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px", height: "auto" },
                                    }}
                                />
                                <button type="submit" className="btn" style={{ borderRadius: '8px', background: '#ffffff', color: '#0056b3', border: 'none', padding: '0 30px', fontWeight: 700, boxShadow: 'none', flexShrink: 0, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  Subscribe
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>



          <footer className="space-pt mt-0 footer" style={{ background: 'rgba(0, 86, 179, 0.95)' }}>
          <div className="container pt-5">
            <div className="row pb-5 pb-lg-6 mb-lg-3">
              <div className="col-sm-6 col-lg-4 mb-4 mb-lg-0 pr-lg-5">
                <a href="index.html"><img className="img-fluid mb-3 footer-logo" src={logo.src} alt="" /></a>
                <p className="text-white">The best way is to develop and follow a plan. Start with your goals in mind and then work backward to develop the plan.</p>
                <h5 className="text-white mb-2 mb-sm-4">Follow Us</h5>
                <div className="social-icon social-icon-style-02">
                  <ul>
                    <li><a href="#"><FacebookIcon className="fab fa-facebook-f" style={{ fontSize: '20px' }} /></a></li>
                    <li><a href="#"><TwitterIcon className="fab fa-twitter" style={{ fontSize: '20px' }} /></a></li>
                    <li><a href="#"><LinkedInIcon className="fab fa-linkedin-in" style={{ fontSize: '20px' }} /></a></li>
                    <li><a href="#"><InstagramIcon className="fab fa-instagram" style={{ fontSize: '20px' }} /></a></li>
                  </ul>
                </div>
              </div>
              <div className="col-sm-6 col-lg-2 mb-4 mb-lg-0">
                <h5 className="text-white mb-2 mb-sm-4">Category</h5>
                <div className="footer-link">
                  <ul className="list-unstyled mb-0">
                    <li><a className="text-white" href="#">Economics</a></li>
                    <li><a className="text-white" href="#">Natural</a></li>
                    <li><a className="text-white" href="#">Architecture</a></li>
                    <li><a className="text-white" href="#">Electrical</a></li>
                    <li><a className="text-white" href="#">Biological</a></li>
                    <li><a className="text-white" href="#">Psychology</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-sm-6 col-lg-2 mb-4 mb-sm-0">
                <h5 className="text-white mb-2 mb-sm-4">Useful Link</h5>
                <div className="footer-link">
                  <ul className="list-unstyled mb-0">
                    <li><a className="text-white" href="index.html">Home</a></li>
                    <li><a className="text-white" href="#">Blogs</a></li>
                    <li><a className="text-white" href="#">Events</a></li>
                    <li><a className="text-white" href="course.html">Courses</a></li>
                    <li><a className="text-white" href="privacy-policy.html">Privacy Policy</a></li>
                    <li><a className="text-white" href="pricing.html">Pricing</a></li>
                    <li><a className="text-white" href="faq.html">Faq</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-sm-6 col-lg-4">
                <h5 className="text-white mb-2 mb-sm-4">Contact Us</h5>
                <p className="text-white">Helped thousands of clients to find the right property for their needs.</p>
                <div className="footer-contact-info">
                  <div className="contact-address mt-4">
                    <div className="contact-item">
                      <LocationOnIcon className="fas fa-map-marker-alt" style={{ fontSize: '24px', color: '#28a745' }} />
                      <p className="ml-3 mb-0 text-white">6580 Allison Turnpike Creminfort, AL 32808-4509</p>
                    </div>
                    <div className="contact-item">
                      <PhoneIcon className="fas fa-phone-alt" style={{ fontSize: '24px', color: '#28a745' }} />
                      <p className="mb-0 font-weight-bold ml-3"><a className="text-white" href="#">+(123) 456-7890</a></p>
                    </div>
                    <div className="contact-item mb-0">
                      <EmailIcon className="fas fa-envelope" style={{ fontSize: '24px', color: '#28a745' }} />
                      <a className="text-white ml-3 text-white" href="#">letstalk@academic.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom py-4" style={{ backgroundColor: '#001a35' }}>
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-12 text-center">
                  <p className="mb-0 text-white">©Copyright 2020 <a href="index.html">academic</a> All Rights Reserved</p>
                </div>
              </div>
            </div>
          </div>
          </footer>
        </div>



        <div id="back-to-top" className="back-to-top">up</div>





        
        
        


        
        
        
        
        
        
        
        
        


        


      </div>
      {isLoginOpen && <LoginForm onClose={() => setIsLoginOpen(false)} />}
      
      
      
      
      
      
      
      
      
      
      
      
      

    </>
  );
}
