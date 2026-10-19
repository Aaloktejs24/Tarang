"use client";

import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const fazer1 = keyframes`
  0% { left: 0; }
  100% { left: -80px; opacity: 0; }
`;

const fazer2 = keyframes`
  0% { left: 0; }
  100% { left: -100px; opacity: 0; }
`;

const fazer3 = keyframes`
  0% { left: 0; }
  100% { left: -50px; opacity: 0; }
`;

const fazer4 = keyframes`
  0% { left: 0; }
  100% { left: -150px; opacity: 0; }
`;

const speeder = keyframes`
  0% { transform: translate(2px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -3px) rotate(-1deg); }
  20% { transform: translate(-2px, 0px) rotate(1deg); }
  30% { transform: translate(1px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 3px) rotate(-1deg); }
  60% { transform: translate(-1px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-2px, -1px) rotate(1deg); }
  90% { transform: translate(2px, 1px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
`;

const lf = keyframes`
  0% { left: 200%; }
  100% { left: -200%; opacity: 0; }
`;

const lf2 = keyframes`
  0% { left: 200%; }
  100% { left: -200%; opacity: 0; }
`;

const lf3 = keyframes`
  0% { left: 200%; }
  100% { left: -100%; opacity: 0; }
`;

const lf4 = keyframes`
  0% { left: 200%; }
  100% { left: -100%; opacity: 0; }
`;

const starsSmall = keyframes`
  from { transform: translateY(0px); }
  to { transform: translateY(-2000px); }
`;

const starsMedium = keyframes`
  from { transform: translateY(0px); }
  to { transform: translateY(-2000px); }
`;

// eslint-disable-next-line no-unused-vars
const starsLarge = keyframes`
  from { transform: translateY(0px); }
  to { transform: translateY(-2000px); }
`;

const nebulaPulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); filter: brightness(1); }
  50% { opacity: 1; transform: scale(1.3); filter: brightness(1.5) drop-shadow(0 0 5px #fff); }
`;

const pulseText = keyframes`
  0%, 100% { opacity: 0.5; letter-spacing: 4px; }
  50% { opacity: 1; letter-spacing: 6px; }
`;

const StyledWrapper = styled.div`
  width: ${props => props.mini ? '60px' : '100%'};
  height: ${props => props.mini ? '24px' : (props.fullPage ? '100vh' : '100%')};
  display: flex;
  justify-content: center;
  align-items: center;
  position: ${props => props.fullPage ? 'fixed' : (props.mini ? 'relative' : 'relative')};
  top: 0;
  left: 0;
  z-index: 9999;
  background: ${props => props.fullPage ? (props.transparent ? 'rgba(0, 0, 0, 0.85)' : '#000000') : 'transparent'};
  overflow: hidden;
  backdrop-filter: ${props => (props.fullPage && props.transparent) ? 'blur(10px)' : 'none'};
  transform: ${props => props.mini ? 'scale(0.3)' : 'none'};
  transform-origin: center;

  /* Universe Elements */
  .stars-container {
    display: ${props => props.fullPage ? 'block' : 'none'};
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .star {
    position: absolute;
    background: white;
    border-radius: 50%;
    animation: ${twinkle} var(--duration) ease-in-out infinite alternate;
    animation-delay: var(--delay);
    box-shadow: 0 0 10px #fff, 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3);
  }

  .stars-small {
    width: 1px;
    height: 1px;
    background: transparent;
    box-shadow: 700px 300px #FFF, 422px 1450px #FFF, 100px 100px #FFF, 1800px 200px #FFF, 500px 800px #FFF, 1200px 1000px #FFF, 100px 1800px #FFF, 900px 100px #FFF, 1500px 500px #FFF;
    animation: ${starsSmall} 50s linear infinite;
    &:after {
      content: " ";
      position: absolute;
      top: 2000px;
      width: 1px;
      height: 1px;
      background: transparent;
      box-shadow: 700px 300px #FFF, 422px 1450px #FFF, 100px 100px #FFF, 1800px 200px #FFF, 500px 800px #FFF, 1200px 1000px #FFF, 100px 1800px #FFF, 900px 100px #FFF, 1500px 500px #FFF;
    }
  }

  .stars-medium {
    width: 2px;
    height: 2px;
    background: transparent;
    box-shadow: 200px 300px #FFF, 1422px 450px #28a745, 600px 100px #FFF, 800px 1200px #28a745, 300px 1800px #FFF;
    animation: ${starsMedium} 100s linear infinite;
    &:after {
      content: " ";
      position: absolute;
      top: 2000px;
      width: 2px;
      height: 2px;
      background: transparent;
      box-shadow: 200px 300px #FFF, 1422px 450px #28a745, 600px 100px #FFF, 800px 1200px #28a745, 300px 1800px #FFF;
    }
  }

  .nebula {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1000px;
    height: 1000px;
    margin-left: -500px;
    margin-top: -500px;
    background: radial-gradient(circle, rgba(0, 86, 179, 0.2) 0%, rgba(40, 167, 69, 0.08) 40%, transparent 70%);
    filter: blur(100px);
    animation: ${nebulaPulse} 15s ease-in-out infinite;
    pointer-events: none;
    z-index: -1;
  }

  .loader {
    position: absolute;
    top: 50%;
    margin-left: -50px;
    left: 50%;
    animation: ${speeder} 0.4s linear infinite;
    z-index: 10;
    
    /* Intense Tarang Neon Bloom (Blue + Green) */
    filter: ${props => props.fullPage ? 'drop-shadow(0 0 20px rgba(0, 86, 179, 0.8)) drop-shadow(0 0 40px rgba(40, 167, 69, 0.6))' : 'none'};
  }

  .loading-text {
    position: absolute;
    bottom: 15%;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-family: 'Inter', sans-serif;
    letter-spacing: 4px;
    font-size: 14px;
    text-transform: uppercase;
    animation: ${pulseText} 1.5s ease-in-out infinite;
    display: ${props => props.fullPage ? 'block' : 'none'};
    text-shadow: 0 0 10px rgba(0, 86, 179, 0.8), 0 0 20px rgba(40, 167, 69, 0.5);
    z-index: 20;

    span {
      display: inline-block;
      animation: ${pulseText} 1.5s ease-in-out infinite;
      &:nth-of-type(2) { animation-delay: 0.2s; }
      &:nth-of-type(3) { animation-delay: 0.4s; }
    }
  }

  .loader > span {
    height: 6px;
    width: 35px;
    background: ${props => props.fullPage ? 'linear-gradient(90deg, #fff 30%, #0056b3 70%)' : '#0056b3'};
    position: absolute;
    top: -19px;
    left: 60px;
    border-radius: 4px 12px 2px 2px;
    filter: ${props => props.fullPage ? 'drop-shadow(0 0 10px rgba(0, 86, 179, 0.8))' : 'none'};
  }
  .base span {
    position: absolute;
    width: 0;
    height: 0;
    border-top: 7px solid transparent;
    border-right: 100px solid ${props => props.fullPage ? '#ffffffcc' : '#0056b3'};
    border-bottom: 7px solid transparent;
    filter: ${props => props.fullPage ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' : 'none'};
  }
  .base span:before {
    content: "";
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: ${props => props.fullPage ? 'radial-gradient(circle at 30% 30%, #fff, #0056b3)' : '#0056b3'};
    position: absolute;
    right: -110px;
    top: -17px;
    border: 1px solid ${props => props.fullPage ? '#28a74588' : 'transparent'};
  }
  .base span:after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-top: 0 solid transparent;
    border-right: 55px solid ${props => props.fullPage ? '#0056b3' : '#0056b3'};
    border-bottom: 18px solid transparent;
    top: -16px;
    right: -98px;
    opacity: 0.8;
  }
  .face {
    position: absolute;
    height: 14px;
    width: 22px;
    background: ${props => props.fullPage ? '#28a745' : '#0056b3'};
    border-radius: 20px 20px 0 0;
    transform: rotate(-40deg);
    right: -128px;
    top: -16px;
    box-shadow: ${props => props.fullPage ? '0 0 15px #28a745, inset 0 0 5px rgba(255,255,255,0.8)' : 'none'};
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .face:after {
    content: "";
    height: 14px;
    width: 14px;
    background: ${props => props.fullPage ? 'linear-gradient(135deg, #fff, #0056b3)' : '#0056b3'};
    right: 4px;
    top: 7px;
    position: absolute;
    transform: rotate(40deg);
    transform-origin: 50% 50%;
    border-radius: 0 0 0 4px;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
  }
  .loader > span > span:nth-of-type(1),
  .loader > span > span:nth-of-type(2),
  .loader > span > span:nth-of-type(3),
  .loader > span > span:nth-of-type(4) {
    width: 30px;
    height: 1px;
    background: ${props => props.fullPage ? '#28a74588' : '#28a745'};
    position: absolute;
    filter: ${props => props.fullPage ? 'drop-shadow(0 0 4px #28a745)' : 'none'};
  }
  .loader > span > span:nth-of-type(1) {
    animation: ${fazer1} 0.2s linear infinite;
  }
  .loader > span > span:nth-of-type(2) {
    top: 3px;
    animation: ${fazer2} 0.4s linear infinite;
  }
  .loader > span > span:nth-of-type(3) {
    top: 1px;
    animation: ${fazer3} 0.4s linear infinite;
    animation-delay: -1s;
  }
  .loader > span > span:nth-of-type(4) {
    top: 4px;
    animation: ${fazer4} 1s linear infinite;
    animation-delay: -1s;
  }

  .longfazers {
    position: absolute;
    width: 100%;
    height: 100%;
    display: ${props => props.mini ? 'none' : 'block'};
    z-index: 5;
  }
  .longfazers span {
    position: absolute;
    height: 2px;
    width: 120px;
    background: ${props => props.fullPage ? '#28a74544' : '#28a745'};
    opacity: 0.3;
    filter: ${props => props.fullPage ? 'drop-shadow(0 0 4px #28a745)' : 'none'};
  }
  .longfazers span:nth-of-type(1) {
    top: 20%;
    animation: ${lf} 0.6s linear infinite;
    animation-delay: -5s;
  }
  .longfazers span:nth-of-type(2) {
    top: 40%;
    animation: ${lf2} 0.8s linear infinite;
    animation-delay: -1s;
  }
  .longfazers span:nth-of-type(3) {
    top: 60%;
    animation: ${lf3} 0.6s linear infinite;
  }
  .longfazers span:nth-of-type(4) {
    top: 80%;
    animation: ${lf4} 0.5s linear infinite;
    animation-delay: -3s;
  }
`;

const Loader = ({ fullPage = false, mini = false, transparent = false }) => {
  return (
    <StyledWrapper fullPage={fullPage} mini={mini} transparent={transparent}>
      <div className="stars-container">
        <div className="stars-small" />
        <div className="stars-medium" />
        <div className="nebula" />
        
        {fullPage && (
          <>
            {/* Many Shiny Realistic Stars */}
            <div className="star" style={{ top: '10%', left: '15%', width: '2px', height: '2px', '--duration': '2s', '--delay': '0s' }} />
            <div className="star" style={{ top: '30%', left: '80%', width: '3px', height: '3px', '--duration': '3s', '--delay': '1s' }} />
            <div className="star" style={{ top: '70%', left: '20%', width: '2px', height: '2px', '--duration': '2.5s', '--delay': '0.5s' }} />
            <div className="star" style={{ top: '80%', left: '70%', width: '4px', height: '4px', '--duration': '4s', '--delay': '1.2s' }} />
            <div className="star" style={{ top: '40%', left: '10%', width: '2px', height: '2px', '--duration': '3.5s', '--delay': '0.3s' }} />
            <div className="star" style={{ top: '50%', left: '90%', width: '2px', height: '2px', '--duration': '2.8s', '--delay': '0.7s' }} />
            <div className="star" style={{ top: '5%', left: '50%', width: '3px', height: '3px', '--duration': '5s', '--delay': '2s' }} />
            <div className="star" style={{ top: '20%', left: '35%', width: '2px', height: '2px', '--duration': '3.2s', '--delay': '0.4s' }} />
            <div className="star" style={{ top: '85%', left: '40%', width: '2px', height: '2px', '--duration': '4.1s', '--delay': '1.6s' }} />
            <div className="star" style={{ top: '60%', left: '85%', width: '3px', height: '3px', '--duration': '3.7s', '--delay': '0.9s' }} />
            <div className="star" style={{ top: '15%', left: '55%', width: '2px', height: '2px', '--duration': '2.4s', '--delay': '1.1s' }} />
            <div className="star" style={{ top: '45%', left: '25%', width: '2px', height: '2px', '--duration': '3.9s', '--delay': '0.2s' }} />
            <div className="star" style={{ top: '75%', left: '50%', width: '3px', height: '3px', '--duration': '4.5s', '--delay': '1.8s' }} />
            <div className="star" style={{ top: '95%', left: '15%', width: '2px', height: '2px', '--duration': '2.6s', '--delay': '0s' }} />
            <div className="star" style={{ top: '35%', left: '65%', width: '2px', height: '2px', '--duration': '5.2s', '--delay': '2.5s' }} />
          </>
        )}
      </div>
      <div className="loading-text">
        Loading<span>.</span><span>.</span><span>.</span>
      </div>
      <div>
        <div className="loader">
          <span><span /><span /><span /><span /></span>
          <div className="base">
            <span />
            <div className="face" />
          </div>
        </div>
        {!mini && (
          <div className="longfazers">
            <span /><span /><span /><span />
          </div>
        )}
      </div>
    </StyledWrapper>
  );
}

export default Loader;
