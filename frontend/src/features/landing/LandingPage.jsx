"use client";

import React, { useState, useEffect } from 'react';
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
      "/js/shuffle/shuffle.min.js",
      "/js/custom.js"
    ];
    let i = 0;
    const loadNext = () => {
      if (i >= scripts.length) return;
      const s = document.createElement("script");
      s.src = scripts[i];
      s.async = false;
      s.onload = () => { i++; loadNext(); };
      document.body.appendChild(s);
    };
    // Only load if jQuery isn't already loaded to prevent duplicate loading on re-renders
    if (!window.jQuery) {
      loadNext();
    }
  }, []);

  return (
    <>

      <link rel="stylesheet" href="/css/bootstrap/bootstrap.min.css" />
      <link rel="stylesheet" href="/css/select2/select2.css" />
      <link rel="stylesheet" href="/css/owl-carousel/owl.carousel.min.css" />
      <link rel="stylesheet" href="/css/magnific-popup/magnific-popup.css" />
      <link rel="stylesheet" href="/css/swiper/swiper.min.css" />
      <link rel="stylesheet" href="/css/animate/animate.min.css" />
      <link rel="stylesheet" href="/css/font-awesome/all.min.css" />
      <link rel="stylesheet" href="/css/flaticon/flaticon.css" />
      <link rel="stylesheet" href="/css/style.css" />

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
                          <h1 className="animated text-white mb-4" data-swiper-animation="fadeInUp" data-duration="1.5s" data-delay="0.25s">Exceptional Education. Exceptional Value.</h1>
                          <div className="animated text-white px-lg-5" data-swiper-animation="fadeInUp" data-duration="2.5s" data-delay="0.25s">
                            <p className="d-none d-sm-block">The first thing to remember about success is that it is a process nothing more, nothing less. There is really no magic to it and it’s not reserved only for a select few people.</p>
                          </div>
                          <a href="#" className="animated4 btn btn-white mt-4 mr-1 mr-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s">Read More<span></span></a>
                          <a href="#" className="animated4 btn btn-primary mt-4 ml-1 ml-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s">Learn More<span></span></a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="swiper-slide align-items-center d-flex bg-overlay-black-40" style={{ "backgroundImage": "url('https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=2000')", "backgroundSize": "cover", "backgroundPosition": "center center" }}>
                <div className="swipeinner container">
                  <div className="row justify-content-start">
                    <div className="col-xl-8 col-lg-10 col-md-12">
                      <div className="slider-2">
                        <div className="animated" data-swiper-animation="fadeInUp" data-duration="1s" data-delay="0.25s">
                          <h1 className="animated text-white mb-4" data-swiper-animation="fadeInUp" data-duration="1s" data-delay="0.25s">The Education You Want. The Attention You Deserve</h1>
                          <div className="animated text-dark" data-swiper-animation="fadeInUp" data-duration="2.5s" data-delay="0.25s">
                            <p className="text-white d-none d-sm-block">There are basically six key areas to higher achievement. Some people will tell you there are four while others may tell you there are eight.</p>
                          </div>
                          <a href="#" className="animated4 btn btn-dark mt-4" data-swiper-animation="fadeInUp" data-duration="3s" data-delay="0.25s">Learn More<span></span></a>
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
                          <h1 className="animated text-white mb-4" data-swiper-animation="fadeInUp" data-duration="1.5s" data-delay="0.25s">Empowering Your Future</h1>
                          <div className="animated text-white px-lg-5" data-swiper-animation="fadeInUp" data-duration="2.5s" data-delay="0.25s">
                            <p className="d-none d-sm-block">Join our platform to experience modern education.</p>
                          </div>
                          <a href="#" className="animated4 btn btn-primary mt-4 ml-1 ml-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s">Learn More<span></span></a>
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
                          <h1 className="animated text-white mb-4" data-swiper-animation="fadeInUp" data-duration="1.5s" data-delay="0.25s">Interactive Learning Environment</h1>
                          <div className="animated text-white px-lg-5" data-swiper-animation="fadeInUp" data-duration="2.5s" data-delay="0.25s">
                            <p className="d-none d-sm-block">Join our platform to experience modern education.</p>
                          </div>
                          <a href="#" className="animated4 btn btn-primary mt-4 ml-1 ml-sm-2" data-swiper-animation="fadeInUp" data-duration="3.5s" data-delay="0.25s">Learn More<span></span></a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="swiper-button-prev text-white"><ArrowBackIcon className="fa fa-arrow-left" style={{ fontSize: 'inherit' }} /></div>
          <div className="swiper-button-next text-white"><ArrowForwardIcon className="fa fa-arrow-right" style={{ fontSize: 'inherit' }} /></div>
        </section>



        <section className="mt-md-n5 mt-4 position-relative z-index-9">
          <div className="container">
            <form className="course-form border-radius">
              <div className="row">
                <div className="col-md-4 mb-4 mb-md-0">
                  <div className="form-group mb-0">
                    <label>Full Name</label>
                    <input className="form-control" type="text" id="name" placeholder="Your Name" />
                    <PersonIcon className="far fa-user" style={{ fontSize: 'inherit' }} />
                  </div>
                </div>
                <div className="col-md-4 mb-4 mb-md-0">
                  <div className="form-group select-border mb-0">
                    <label>Your Courses</label>
                    <select className="form-control basic-select" defaultValue="1">
                      <option value="1">Please Choose</option>
                      <option value="2">Electrical Engineering</option>
                      <option value="3">Computer Science</option>
                      <option value="4">Biological Sciences</option>
                      <option value="4">Masters in Accounting</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4 align-self-center">
                  <div className="course-serach">
                    <a className="btn btn-dark btn-block mt-md-4" href="#">Search Course</a>
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
                <a href="#" className="btn btn-primary btn-round">Read More</a>
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



        <section className="space-pb">
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
                <a className="btn btn-primary" href="#">All Courses</a>
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
                    <a className="btn btn-primary btn-round" href="#">View All</a>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="events">
                      <div className="row">
                        <div className="col-12">
                          <div className="events border p-4 bg-white border-radius">
                            <div className="row">
                              <div className="col-lg-3">
                                <div className="events-img mb-4 mb-lg-0">
                                  <img className="img-fluid border-0 rounded" style={{ height: '180px', width: '100%', objectFit: 'cover' }} src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800" alt="" />
                                </div>
                              </div>
                              <div className="col-lg-6 align-self-center">
                                <div className="events-content">
                                  <div className="events-tag mb-3">
                                    <a href="#" className="badge badge-primary">Art Competition</a>
                                  </div>
                                  <a href="event-detail.html" className="text-dark h5">Young leaders in tech policy fellowship</a>
                                  <div className="events-meta my-3">
                                    <ul className="list-unstyled mb-0 d-flex">
                                      <li className="mr-3"><a href="#"><CalendarMonthIcon className="fas fa-calendar-alt pr-1" style={{ fontSize: 'inherit' }} /> 5 Oct, 2020</a></li>
                                      <li><a href="#"><AccessTimeIcon className="fas fa-clock pr-1" style={{ fontSize: 'inherit' }} />  9:00 AM - 11:00 AM</a></li>
                                    </ul>
                                  </div>
                                  <p className="text-dark mb-lg-0">Franklin’s extraordinary success in life and politics can be attributed to his perseverance to overcome his personal liabilities, and his desire to constantly become better.</p>
                                </div>
                              </div>
                              <div className="col-lg-3 align-self-center text-lg-right text-left">
                                <a className="btn btn-primary btn-round" href="#">Join Event</a>
                              </div>
                            </div>
                          </div>
                          <div className="events border mt-4 p-4 bg-white border-radius">
                            <div className="row">
                              <div className="col-lg-3">
                                <div className="events-img mb-4 mb-lg-0">
                                  <img className="img-fluid border-0 rounded" style={{ height: '180px', width: '100%', objectFit: 'cover' }} src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800" alt="" />
                                </div>
                              </div>
                              <div className="col-lg-6 align-self-center">
                                <div className="events-content">
                                  <div className="events-tag mb-3">
                                    <a href="#" className="badge badge-primary">Architecture Events</a>
                                  </div>
                                  <a href="event-detail.html" className="text-dark h5">Expert panel- careers in tech policy</a>
                                  <div className="events-meta my-3">
                                    <ul className="list-unstyled mb-0 d-flex">
                                      <li className="mr-3"><a href="#"><CalendarMonthIcon className="fas fa-calendar-alt pr-1" style={{ fontSize: 'inherit' }} /> 05 Nov, 2020</a></li>
                                      <li><a href="#"><AccessTimeIcon className="fas fa-clock pr-1" style={{ fontSize: 'inherit' }} />  2:00 PM - 4:00 PM</a></li>
                                    </ul>
                                  </div>
                                  <p className="text-dark mb-lg-0">Next time you really want to achieve something, take time to focus on your own personal journal. What is your temptation that is standing in your way to greatness?</p>
                                </div>
                              </div>
                              <div className="col-lg-3 align-self-center text-lg-right text-left">
                                <a className="btn btn-primary btn-round" href="#">Join Event</a>
                              </div>
                            </div>
                          </div>
                          <div className="events border mt-4 p-4 bg-white border-radius">
                            <div className="row">
                              <div className="col-lg-3">
                                <div className="events-img mb-4 mb-lg-0">
                                  <img className="img-fluid border-0 rounded" style={{ height: '180px', width: '100%', objectFit: 'cover' }} src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800" alt="" />
                                </div>
                              </div>
                              <div className="col-lg-6 align-self-center">
                                <div className="events-content">
                                  <div className="events-tag mb-3">
                                    <a href="#" className="badge badge-primary">Medicine Events</a>
                                  </div>
                                  <a href="event-detail.html" className="text-dark h5">Health and life expectancy</a>
                                  <div className="events-meta my-3">
                                    <ul className="list-unstyled mb-0 d-flex">
                                      <li className="mr-3"><a href="#"><CalendarMonthIcon className="fas fa-calendar-alt pr-1" style={{ fontSize: 'inherit' }} /> 27 Nov, 2020</a></li>
                                      <li><a href="#"><AccessTimeIcon className="fas fa-clock pr-1" style={{ fontSize: 'inherit' }} />  4:00 PM - 6:00 PM</a></li>
                                    </ul>
                                  </div>
                                  <p className="text-dark mb-lg-0">Get yourself nice and relaxed and settled. Concentrate on your breathing, engage in the moment and spend some time being still, quiet and drift inside of your own mind.</p>
                                </div>
                              </div>
                              <div className="col-lg-3 align-self-center text-lg-right text-left">
                                <a className="btn btn-primary btn-round" href="#">Join Event</a>
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
                      <li><a href="#"><FacebookIcon className="fab fa-facebook-f" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#"><TwitterIcon className="fab fa-twitter" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#"><LinkedInIcon className="fab fa-linkedin-in" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#"><InstagramIcon className="fab fa-instagram" style={{ fontSize: 'inherit' }} /></a></li>
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
                      <li><a href="#"><FacebookIcon className="fab fa-facebook-f" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#"><TwitterIcon className="fab fa-twitter" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#"><LinkedInIcon className="fab fa-linkedin-in" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#"><InstagramIcon className="fab fa-instagram" style={{ fontSize: 'inherit' }} /></a></li>
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
                      <li><a href="#"><FacebookIcon className="fab fa-facebook-f" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#"><TwitterIcon className="fab fa-twitter" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#"><LinkedInIcon className="fab fa-linkedin-in" style={{ fontSize: 'inherit' }} /></a></li>
                      <li><a href="#"><InstagramIcon className="fab fa-instagram" style={{ fontSize: 'inherit' }} /></a></li>
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
          <section className="space-ptb mb-0" style={{ zIndex: 2, background: 'rgba(0, 86, 179, 0.85)' }}>
          <div className="container pb-5">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="text-white d-block mb-4 h6 font-weight-normal">Are you ready to start your journey with us?</span>
                <h2 className="text-white mb-4 display-7">Education for Individual and Social Responsibility</h2>
                <a className="btn btn-primary mr-sm-3 mt-3" href="#">Become A Student</a>
                <a className="btn btn-white mt-3" href="#">Discover More</a>
              </div>
            </div>
          </div>
            <div className="w-100" style={{ position: 'absolute', bottom: 0, transform: 'translateY(50%)', zIndex: 9 }}>
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-10">
                    <div className="p-5 bg-primary-gradient border-radius shadow">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="row justify-content-between">
                            <div className="col-lg-7 col-md-8 align-self-center mb-4 mb-md-0">
                              <h2 className="text-white">Subscribe</h2>
                              <p className="mb-0 text-white">Now go push your own limits and succeed!</p>
                            </div>
                            <div className="col-lg-5 col-md-4 justify-content-end align-self-center">
                              <div className="subscribe-form">
                                <form action="#" style={{ position: 'relative' }}>
                                  <input className="form-control" placeholder="Enter your email" type="email" />
                                  <a href="#" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#0056b3' }}>
                                    <ArrowRightAltIcon style={{ fontSize: 'inherit' }} />
                                  </a>
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
            </div>
        </section>



          <footer className="space-pt mt-0 footer" style={{ background: 'linear-gradient(to right, rgba(0, 86, 179, 0.85) 30%, rgba(40, 167, 69, 0.85) 100%)' }}>
          <div className="container pt-5">
            <div className="row pb-5 pb-lg-6 mb-lg-3">
              <div className="col-sm-6 col-lg-4 mb-4 mb-lg-0 pr-lg-5">
                <a href="index.html"><img className="img-fluid mb-3 footer-logo" src={logo.src} alt="" /></a>
                <p className="text-white">The best way is to develop and follow a plan. Start with your goals in mind and then work backward to develop the plan.</p>
                <h5 className="text-white mb-2 mb-sm-4">Follow Us</h5>
                <div className="social-icon social-icon-style-02">
                  <ul>
                    <li><a href="#"><FacebookIcon className="fab fa-facebook-f" style={{ fontSize: 'inherit' }} /></a></li>
                    <li><a href="#"><TwitterIcon className="fab fa-twitter" style={{ fontSize: 'inherit' }} /></a></li>
                    <li><a href="#"><LinkedInIcon className="fab fa-linkedin-in" style={{ fontSize: 'inherit' }} /></a></li>
                    <li><a href="#"><InstagramIcon className="fab fa-instagram" style={{ fontSize: 'inherit' }} /></a></li>
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
                    <li><a className="text-white" href="about-us.html">About</a></li>
                    <li><a className="text-white" href="course.html">Course</a></li>
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
                      <LocationOnIcon className="fas fa-map-marker-alt" style={{ fontSize: 'inherit' }} />
                      <p className="ml-3 mb-0 text-white">6580 Allison Turnpike Creminfort, AL 32808-4509</p>
                    </div>
                    <div className="contact-item">
                      <MicIcon className="fas fa-microphone-alt" style={{ fontSize: 'inherit' }} />
                      <p className="mb-0 font-weight-bold ml-3"><a className="text-white" href="#">+(123) 456-7890</a></p>
                    </div>
                    <div className="contact-item mb-0">
                      <HeadsetIcon className="fas fa-headset" style={{ fontSize: 'inherit' }} />
                      <a className="text-white ml-3 text-white" href="#">letstalk@academic.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom bg-dark py-4">
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
