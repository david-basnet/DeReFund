import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import './AuthForm.css';

const AuthForm = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false
  });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
    role: '',
    emailContact: false,
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const authContainerRef = useRef(null);
  const signInFormRef = useRef(null);
  const signUpFormRef = useRef(null);
  const forgotPasswordFormRef = useRef(null);
  const overlayPanelLeftRef = useRef(null);
  const overlayPanelRightRef = useRef(null);
  const overlayRef_internal = useRef(null);
  const overlayContainerRef = useRef(null);

  // Handles modal open/close animations and form cleanup
  useEffect(() => {
    if (isOpen) {
      setIsForgotPassword(false);
      setIsSignUp(initialMode === 'signup');
      if (initialMode === 'signup') {
        setRegisterData({
          username: '',
          email: '',
          password: '',
          repeatPassword: '',
          role: '',
          emailContact: false,
          acceptTerms: false
        });
      }
      setForgotPasswordEmail('');

      if (isForgotPassword) return;

      requestAnimationFrame(() => {
        // Clean up leftover forgot password elements and restore form state
        if (signInFormRef.current) {
          const signInForm = signInFormRef.current.querySelector('form');
          if (signInForm) {
            const descElements = signInForm.querySelectorAll('.forgot-password-description');
            descElements.forEach(el => el.remove());
            const backLinks = signInForm.querySelectorAll('.back-to-signin');
            backLinks.forEach(el => el.remove());
            
            const allInputs = signInForm.querySelectorAll('input');
            const allButtons = signInForm.querySelectorAll('button');
            const allDivs = signInForm.querySelectorAll('div');
            const allLinks = signInForm.querySelectorAll('a');
            
            [...allInputs, ...allButtons, ...allDivs, ...allLinks].forEach(el => {
              gsap.set(el, { clearProps: 'all' });
              el.style.transform = '';
              el.style.opacity = '';
              el.style.display = '';
            });
            
            const emailInput = signInForm.querySelector('input[type="email"]');
            const passwordInput = signInForm.querySelector('input[type="password"]');
            const keepLoggedInDiv = signInForm.querySelector('.keep-logged-in');
            const forgotPasswordLink = signInForm.querySelector('.forgot-password');
            const submitButton = signInForm.querySelector('button[type="submit"]');
            
            if (emailInput) {
              emailInput.style.display = 'block';
              emailInput.value = loginData.email;
              emailInput.onchange = (e) => handleLoginChange(e);
              emailInput.type = 'email';
              emailInput.placeholder = 'Email';
            }
            if (passwordInput) {
              passwordInput.style.display = 'block';
              passwordInput.type = 'password';
              passwordInput.placeholder = 'Password';
            }
            if (keepLoggedInDiv) {
              keepLoggedInDiv.style.display = 'flex';
              keepLoggedInDiv.style.alignItems = 'flex-start';
              keepLoggedInDiv.style.gap = '8px';
            }
            if (forgotPasswordLink) {
              forgotPasswordLink.style.display = 'block';
              forgotPasswordLink.onclick = handleForgotPasswordClick;
            }
            if (submitButton) {
              submitButton.textContent = 'Sign In';
              submitButton.type = 'submit';
              submitButton.onclick = null;
              submitButton.style.display = 'block';
            }
            
            signInForm.style.margin = '';
            signInForm.style.maxWidth = '';
            signInForm.style.width = '';
            signInForm.style.transform = '';
            signInForm.style.opacity = '';
            gsap.set(signInForm, { clearProps: 'all' });
          }
          
          gsap.set(signInFormRef.current, { 
            x: 0, 
            width: '50%',
            opacity: 1,
            clearProps: 'all' 
          });
        }
        
        if (signInFormRef.current) {
          const signInTitle = signInFormRef.current.querySelector('h1');
          if (signInTitle) {
            signInTitle.textContent = 'Sign in';
            gsap.set(signInTitle, { clearProps: 'all' });
            signInTitle.style.transform = '';
            signInTitle.style.opacity = '';
          }
        }
        if (signUpFormRef.current) {
          gsap.set(signUpFormRef.current, { x: 0, clearProps: 'all' });
        }
        if (forgotPasswordFormRef.current) {
          gsap.set(forgotPasswordFormRef.current, { x: '-100%', opacity: 0, clearProps: 'all' });
        }
        if (overlayRef_internal.current) {
          gsap.set(overlayRef_internal.current, { x: 0, opacity: 1, clearProps: 'all' });
        }

        // Animate modal opening
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        if (overlayRef.current) {
          gsap.set(overlayRef.current, { opacity: 0, backdropFilter: 'blur(0px)', immediateRender: true });
        }
        if (authContainerRef.current) {
          gsap.set(authContainerRef.current, { opacity: 0, scale: 0.95, y: 20, immediateRender: true });
        }
        if (signInFormRef.current && !isSignUp) {
          gsap.set(signInFormRef.current, { 
            x: 0, 
            opacity: 0, 
            immediateRender: true 
          });
        }
        if (signUpFormRef.current && isSignUp) {
          gsap.set(signUpFormRef.current, { 
            x: 0, 
            opacity: 0, 
            immediateRender: true 
          });
        }
        if (overlayPanelLeftRef.current) {
          gsap.set(overlayPanelLeftRef.current, { x: 0, opacity: 0, immediateRender: true });
        }
        if (overlayPanelRightRef.current) {
          gsap.set(overlayPanelRightRef.current, { x: 0, opacity: 0, immediateRender: true });
        }

        if (overlayRef.current) {
          tl.to(overlayRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: 'power1.out'
          }, 0);
        }

        if (authContainerRef.current) {
          tl.to(authContainerRef.current, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
          }, 0.1);
        }

        if (signInFormRef.current && !isSignUp && !isForgotPassword) {
          tl.to(signInFormRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
          }, 0.2);
        }

        if (signUpFormRef.current && isSignUp && !isForgotPassword) {
          tl.to(signUpFormRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
          }, 0.2);
        }

        if (overlayPanelLeftRef.current) {
          tl.to(overlayPanelLeftRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
          }, 0.2);
        }

        if (overlayPanelRightRef.current) {
          tl.to(overlayPanelRightRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
          }, 0.2);
        }

        const signInInputs = signInFormRef.current?.querySelectorAll('input, button, .keep-logged-in, .forgot-password');
        const signUpInputs = signUpFormRef.current?.querySelectorAll('input, button, .role-selection, .terms-checkbox, .email-preference');
        
        if (signInInputs && signInInputs.length > 0) {
          gsap.set(Array.from(signInInputs), { opacity: 0, y: 10, immediateRender: true });
          tl.to(Array.from(signInInputs), {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: 'power1.out'
          }, 0.3);
        }

        if (signUpInputs && signUpInputs.length > 0) {
          gsap.set(Array.from(signUpInputs), { opacity: 0, y: 10, immediateRender: true });
          tl.to(Array.from(signUpInputs), {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: 'power1.out'
          }, 0.3);
        }
      });

    } else {
      // Animate modal closing
      const tl = gsap.timeline();

      if (signInFormRef.current) {
        tl.to(signInFormRef.current, {
          x: -30,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        });
      }

      if (signUpFormRef.current) {
        tl.to(signUpFormRef.current, {
          x: 30,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        }, '-=0.1');
      }

      if (overlayPanelLeftRef.current) {
        tl.to(overlayPanelLeftRef.current, {
          x: -20,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        }, '-=0.1');
      }

      if (overlayPanelRightRef.current) {
        tl.to(overlayPanelRightRef.current, {
          x: 20,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        }, '-=0.1');
      }

      if (authContainerRef.current) {
        tl.to(authContainerRef.current, {
          opacity: 0,
          scale: 0.95,
          y: 20,
          duration: 0.3,
          ease: 'power2.in'
        }, '-=0.2');
      }

      if (overlayRef.current) {
        tl.to(overlayRef.current, {
          opacity: 0,
          backdropFilter: 'blur(0px)',
          duration: 0.3,
          ease: 'power2.in'
        }, '-=0.2');
      }
    }
  }, [isOpen, initialMode]);

  // Handles sign-in/sign-up form switching animation
  useEffect(() => {
    if (containerRef.current) {
      if (isSignUp) {
        containerRef.current.classList.add('right-panel-active');
        if (signUpFormRef.current) {
          gsap.set(signUpFormRef.current, { clearProps: 'all' });
        }
      } else {
        containerRef.current.classList.remove('right-panel-active');
        if (signInFormRef.current) {
          gsap.set(signInFormRef.current, { clearProps: 'all' });
        }
      }
    }
  }, [isSignUp]);

  // Ensures overlay buttons remain clickable after forgot password flow
  useEffect(() => {
    if (!isForgotPassword && isOpen) {
      const ensureOverlayClickable = () => {
        if (overlayContainerRef.current) {
          overlayContainerRef.current.style.pointerEvents = 'auto';
          overlayContainerRef.current.style.zIndex = '100';
          overlayContainerRef.current.style.display = 'block';
          const buttons = overlayContainerRef.current.querySelectorAll('button.ghost');
          buttons.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.zIndex = '20';
            btn.style.cursor = 'pointer';
            btn.style.position = 'relative';
          });
          const panels = overlayContainerRef.current.querySelectorAll('.overlay-panel');
          panels.forEach(panel => {
            panel.style.pointerEvents = 'auto';
            panel.style.zIndex = '10';
          });
        } else {
          const overlayContainer = document.querySelector('.overlay-container');
          if (overlayContainer) {
            overlayContainer.style.pointerEvents = 'auto';
            overlayContainer.style.zIndex = '100';
            overlayContainer.style.display = 'block';
            const buttons = overlayContainer.querySelectorAll('button.ghost');
            buttons.forEach(btn => {
              btn.style.pointerEvents = 'auto';
              btn.style.zIndex = '20';
              btn.style.cursor = 'pointer';
              btn.style.position = 'relative';
            });
            const panels = overlayContainer.querySelectorAll('.overlay-panel');
            panels.forEach(panel => {
              panel.style.pointerEvents = 'auto';
              panel.style.zIndex = '10';
            });
          }
        }
      };

      ensureOverlayClickable();
      const timer1 = setTimeout(ensureOverlayClickable, 50);
      const timer2 = setTimeout(ensureOverlayClickable, 150);
      const timer3 = setTimeout(ensureOverlayClickable, 300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isForgotPassword, isOpen]);

  const handleSignUpClick = () => {
    setIsSignUp(true);
    setRegisterData({
      username: '',
      email: '',
      password: '',
      repeatPassword: '',
      role: '',
      emailContact: false,
      acceptTerms: false
    });
  };

  const handleSignInClick = () => {
    setIsSignUp(false);
  };

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login({
        email: loginData.email,
        password: loginData.password,
      });
      onClose();
      
      // Get user role from response - backend returns user in response.data.user
      const userRole = response?.data?.user?.role;
      
      // Redirect based on role
      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else if (userRole === 'NGO') {
        navigate('/ngo');
      } else {
        navigate('/donor');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Frontend validation
    if (!registerData.role) {
      setError('Please select a role (Donor or NGO)');
      return;
    }
    
    if (registerData.username.trim().length < 2 || registerData.username.trim().length > 120) {
      setError('Name must be between 2 and 120 characters');
      return;
    }
    
    if (!registerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      setError('Please provide a valid email address');
      return;
    }
    
    if (registerData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }
    
    if (registerData.password !== registerData.repeatPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!registerData.acceptTerms) {
      setError('You must accept the Terms and Conditions to register');
      return;
    }
    
    setLoading(true);
    try {
      await register({
        name: registerData.username.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        role: registerData.role,
      });
      onClose();
      // Redirect based on role
      if (registerData.role === 'ADMIN') {
        navigate('/admin');
      } else if (registerData.role === 'NGO') {
        navigate('/ngo');
      } else {
        navigate('/donor');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    console.log('Forgot Password Email:', forgotPasswordEmail);
    // TODO: Implement forgot password logic
    alert('Password reset code has been sent to your email!');
  };

  // Handles forgot password animation: form slides to center, title flips, content transforms
  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    if (!authContainerRef.current) return;

    const currentFormRef = isSignUp ? signUpFormRef.current : signInFormRef.current;
    if (!currentFormRef) return;

    setIsForgotPassword(true);
    
    const tl = gsap.timeline();
    
    if (overlayRef_internal.current) {
      tl.to(overlayRef_internal.current, {
        x: '100%',
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut'
      }, 0);
    }
    
    if (overlayContainerRef.current) {
      overlayContainerRef.current.style.pointerEvents = 'none';
      overlayContainerRef.current.style.zIndex = '1';
    }

    const currentFormTitle = currentFormRef.querySelector('h1');
    const currentForm = currentFormRef.querySelector('form');
    const formInputs = currentForm?.querySelectorAll('input:not([type="checkbox"])');
    const formCheckboxes = currentForm?.querySelectorAll('.keep-logged-in, .forgot-password');
    const formButton = currentForm?.querySelector('button[type="submit"]');
    
    if (currentFormRef && currentFormTitle) {
      tl.to(currentFormRef, {
        x: '25%',
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(currentFormRef, {
            width: '100%',
            x: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              if (currentForm) {
                currentForm.style.margin = '0 auto';
                currentForm.style.maxWidth = '400px';
                currentForm.style.width = '100%';
              }
            }
          });
          
          const fadeOutTl = gsap.timeline();
          
          if (formInputs && formInputs.length > 0) {
            fadeOutTl.to(Array.from(formInputs), {
              opacity: 0,
              y: -10,
              duration: 0.3,
              stagger: 0.08,
              ease: 'power2.in',
              onComplete: () => {
                Array.from(formInputs).forEach(input => {
                  input.style.display = 'none';
                });
              }
            }, 0);
          }
          
          if (formCheckboxes && formCheckboxes.length > 0) {
            fadeOutTl.to(Array.from(formCheckboxes), {
              opacity: 0,
              y: -10,
              duration: 0.3,
              ease: 'power2.in',
              onComplete: () => {
                Array.from(formCheckboxes).forEach(el => {
                  el.style.display = 'none';
                });
              }
            }, 0);
          }
          
          if (formButton) {
            fadeOutTl.to(formButton, {
              opacity: 0,
              y: -10,
              duration: 0.3,
              ease: 'power2.in',
              onComplete: () => {
                formButton.style.display = 'none';
              }
            }, 0);
          }
          
          fadeOutTl.to(currentFormTitle, {
            rotationX: 90,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
              currentFormTitle.textContent = 'Forgot Password';
              gsap.fromTo(currentFormTitle, 
                { rotationX: -90, opacity: 0 },
                { 
                  rotationX: 0, 
                  opacity: 1, 
                  duration: 0.3,
                  ease: 'power2.out',
                  onComplete: () => {
                    const emailInput = currentForm.querySelector('input[type="email"]');
                    const passwordInput = currentForm.querySelector('input[type="password"]');
                    const keepLoggedInDiv = currentForm.querySelector('.keep-logged-in');
                    const forgotPasswordLink = currentForm.querySelector('.forgot-password');
                    const submitButton = currentForm.querySelector('button[type="submit"]');
                    
                    let descElement = currentForm.querySelector('.forgot-password-description');
                    if (!descElement) {
                      descElement = document.createElement('p');
                      descElement.className = 'forgot-password-description';
                      descElement.textContent = "Enter your email address and we'll send you a code to reset your password.";
                      currentForm.insertBefore(descElement, currentForm.querySelector('h1').nextSibling);
                    }
                    gsap.set(descElement, { opacity: 0, y: 10, display: 'block' });
                    
                    if (emailInput) {
                      emailInput.value = forgotPasswordEmail;
                      emailInput.onchange = (e) => setForgotPasswordEmail(e.target.value);
                      gsap.set(emailInput, { opacity: 0, y: 10, display: 'block' });
                    }
                    
                    if (passwordInput) passwordInput.style.display = 'none';
                    if (keepLoggedInDiv) keepLoggedInDiv.style.display = 'none';
                    if (forgotPasswordLink) forgotPasswordLink.style.display = 'none';
                    
                    if (submitButton) {
                      submitButton.textContent = 'Send Reset Code';
                      submitButton.onclick = (e) => {
                        e.preventDefault();
                        handleForgotPasswordSubmit(e);
                      };
                      gsap.set(submitButton, { opacity: 0, y: 10, display: 'block' });
                    }
                    
                    let backLink = currentForm.querySelector('.back-to-signin');
                    if (!backLink) {
                      backLink = document.createElement('a');
                      backLink.href = '#';
                      backLink.className = 'back-to-signin';
                      backLink.textContent = 'Back to Sign In';
                      backLink.onclick = handleBackToSignIn;
                      backLink.style.cssText = 'position: relative; z-index: 1000; pointer-events: auto; display: block;';
                      currentForm.appendChild(backLink);
                    }
                    gsap.set(backLink, { opacity: 0, y: 10, display: 'block' });
                    
                    const newElements = [descElement, emailInput, submitButton, backLink].filter(el => el);
                    
                    gsap.to(newElements, {
                      opacity: 1,
                      y: 0,
                      duration: 0.4,
                      stagger: 0.12,
                      ease: 'power2.out'
                    });
                  }
                }
              );
            }
          }, 0.1);
        }
      }, 0);
    }
  };

  // Restores sign-in form after forgot password flow, removes dynamic elements and clears GSAP styles
  const handleBackToSignIn = (e) => {
    if (e) e.preventDefault();
    if (!authContainerRef.current || !signInFormRef.current) return;

    const signInForm = signInFormRef.current.querySelector('form');
    const signInTitle = signInForm.querySelector('h1');
    const descElement = signInForm.querySelector('.forgot-password-description');
    const emailInput = signInForm.querySelector('input[type="email"]');
    const passwordInput = signInForm.querySelector('input[type="password"]');
    const keepLoggedInDiv = signInForm.querySelector('.keep-logged-in');
    const forgotPasswordLink = signInForm.querySelector('.forgot-password');
    const submitButton = signInForm.querySelector('button[type="submit"]');
    const backLink = signInForm.querySelector('.back-to-signin');
    
    setIsForgotPassword(false);
    
    const allDescElements = signInForm.querySelectorAll('.forgot-password-description');
    allDescElements.forEach(el => el.remove());
    const allBackLinks = signInForm.querySelectorAll('.back-to-signin');
    allBackLinks.forEach(el => el.remove());
    
    const allFormElements = signInForm.querySelectorAll('*');
    allFormElements.forEach(el => {
      gsap.set(el, { clearProps: 'all' });
      el.style.transform = '';
      el.style.opacity = '';
      el.style.display = '';
    });
    
    if (signInTitle) {
      signInTitle.textContent = 'Sign in';
      gsap.set(signInTitle, { clearProps: 'all' });
      signInTitle.style.transform = '';
      signInTitle.style.opacity = '';
    }
    
    if (emailInput) {
      emailInput.value = loginData.email;
      emailInput.onchange = (e) => handleLoginChange(e);
      emailInput.style.display = 'block';
      emailInput.type = 'email';
      emailInput.placeholder = 'Email';
      gsap.set(emailInput, { clearProps: 'all' });
      emailInput.style.transform = '';
      emailInput.style.opacity = '';
    }
    
    if (passwordInput) {
      passwordInput.style.display = 'block';
      passwordInput.type = 'password';
      passwordInput.placeholder = 'Password';
      gsap.set(passwordInput, { clearProps: 'all' });
      passwordInput.style.transform = '';
      passwordInput.style.opacity = '';
    }
    
    if (keepLoggedInDiv) {
      keepLoggedInDiv.style.display = 'flex';
      keepLoggedInDiv.style.alignItems = 'flex-start';
      keepLoggedInDiv.style.gap = '8px';
      gsap.set(keepLoggedInDiv, { clearProps: 'all' });
      keepLoggedInDiv.style.transform = '';
      keepLoggedInDiv.style.opacity = '';
    }
    
    if (forgotPasswordLink) {
      forgotPasswordLink.style.display = 'block';
      forgotPasswordLink.onclick = handleForgotPasswordClick;
      gsap.set(forgotPasswordLink, { clearProps: 'all' });
      forgotPasswordLink.style.transform = '';
      forgotPasswordLink.style.opacity = '';
    }
    
    if (submitButton) {
      submitButton.textContent = 'Sign In';
      submitButton.onclick = null;
      submitButton.type = 'submit';
      submitButton.style.display = 'block';
      gsap.set(submitButton, { clearProps: 'all' });
      submitButton.style.transform = '';
      submitButton.style.opacity = '';
    }
    
    gsap.set(signInFormRef.current, { 
      x: 0, 
      width: '50%',
      opacity: 1,
      clearProps: 'all' 
    });
    signInFormRef.current.style.transform = '';
    signInFormRef.current.style.opacity = '';
    
    if (signInForm) {
      signInForm.style.margin = '';
      signInForm.style.maxWidth = '';
      signInForm.style.width = '';
      signInForm.style.transform = '';
      signInForm.style.opacity = '';
      gsap.set(signInForm, { clearProps: 'all' });
    }
    
    setTimeout(() => {
      if (overlayRef_internal.current) {
        gsap.set(overlayRef_internal.current, { x: 0, opacity: 1, immediateRender: true, clearProps: 'all' });
      }
      
      if (overlayPanelLeftRef.current) {
        gsap.set(overlayPanelLeftRef.current, { 
          opacity: 1, 
          pointerEvents: 'auto',
          zIndex: 10,
          immediateRender: true,
          clearProps: 'all'
        });
      }
      if (overlayPanelRightRef.current) {
        gsap.set(overlayPanelRightRef.current, { 
          opacity: 1, 
          pointerEvents: 'auto',
          zIndex: 10,
          immediateRender: true,
          clearProps: 'all'
        });
      }
      
      const ensureOverlayClickable = () => {
        if (overlayContainerRef.current) {
          overlayContainerRef.current.style.display = 'block';
          overlayContainerRef.current.style.pointerEvents = 'auto';
          overlayContainerRef.current.style.zIndex = '100';
          const buttons = overlayContainerRef.current.querySelectorAll('button.ghost');
          buttons.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.zIndex = '20';
            btn.style.cursor = 'pointer';
            btn.style.position = 'relative';
          });
          const panels = overlayContainerRef.current.querySelectorAll('.overlay-panel');
          panels.forEach(panel => {
            panel.style.pointerEvents = 'auto';
            panel.style.zIndex = '10';
          });
        } else {
          const overlayContainer = document.querySelector('.overlay-container');
          if (overlayContainer) {
            overlayContainer.style.pointerEvents = 'auto';
            overlayContainer.style.zIndex = '100';
            overlayContainer.style.display = 'block';
            const buttons = overlayContainer.querySelectorAll('button.ghost');
            buttons.forEach(btn => {
              btn.style.pointerEvents = 'auto';
              btn.style.zIndex = '20';
              btn.style.cursor = 'pointer';
              btn.style.position = 'relative';
            });
            const panels = overlayContainer.querySelectorAll('.overlay-panel');
            panels.forEach(panel => {
              panel.style.pointerEvents = 'auto';
              panel.style.zIndex = '10';
            });
          }
        }
      };
      
      ensureOverlayClickable();
      setTimeout(ensureOverlayClickable, 100);
      setTimeout(ensureOverlayClickable, 200);
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div className="auth-form-overlay" ref={overlayRef} onClick={onClose}>
      <div className={`auth-container ${isForgotPassword ? 'forgot-password-active' : ''}`} id="auth-container" ref={(el) => {
        containerRef.current = el;
        authContainerRef.current = el;
      }} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="auth-close-button"
          aria-label="Close"
          type="button"
        >
          <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Sign Up Form Container */}
        <div className="form-container sign-up-container" ref={signUpFormRef}>
          <form onSubmit={handleRegisterSubmit}>
            <h1>Create Account</h1>
            
            {/* Role Selection */}
            <div className="role-selection">
              <label className="role-label">I am a:</label>
              <div className="role-options">
                <div 
                  className={`role-option-card ${registerData.role === 'DONOR' ? 'selected' : ''}`}
                  onClick={() => setRegisterData(prev => ({ ...prev, role: 'DONOR' }))}
                >
                  <div className="role-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="role-text">Donor</span>
                </div>
                <div 
                  className={`role-option-card ${registerData.role === 'NGO' ? 'selected' : ''}`}
                  onClick={() => setRegisterData(prev => ({ ...prev, role: 'NGO' }))}
                >
                  <div className="role-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="role-text">NGO</span>
                </div>
              </div>
            </div>

            <input 
              type="text" 
              placeholder="Username" 
              name="username"
              value={registerData.username}
              onChange={handleRegisterChange}
              required
            />
            <input 
              type="email" 
              placeholder="Email" 
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
            <div style={{ position: 'relative', width: '100%', margin: '8px 0' }}>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Password" 
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                style={{ 
                  paddingRight: '40px',
                  width: '100%',
                  margin: 0
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: '1',
                  zIndex: 10,
                  width: '20px',
                  height: '20px',
                  outline: 'none'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', margin: '8px 0' }}>
              <input 
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Repeat Password" 
                name="repeatPassword"
                value={registerData.repeatPassword}
                onChange={handleRegisterChange}
                required
                style={{ 
                  paddingRight: '40px',
                  width: '100%',
                  margin: 0
                }}
              />
              <button
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: '1',
                  zIndex: 10,
                  width: '20px',
                  height: '20px',
                  outline: 'none'
                }}
              >
                {showRepeatPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Email Preferences */}
            <div className="email-preference">
              <input
                type="checkbox"
                name="emailContact"
                id="emailContact"
                checked={registerData.emailContact}
                onChange={handleRegisterChange}
              />
              <label htmlFor="emailContact">
                Please contact me via e-mail
              </label>
            </div>

            {/* Terms and Conditions */}
            <div className="terms-checkbox">
              <input
                type="checkbox"
                name="acceptTerms"
                id="acceptTerms"
                checked={registerData.acceptTerms}
                onChange={handleRegisterChange}
                required
              />
              <label htmlFor="acceptTerms">
                I have read and accept the <Link to="/terms" className="terms-link">Terms and Conditions</Link>
              </label>
            </div>

            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Form Container */}
        <div className="form-container sign-in-container" ref={signInFormRef}>
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign in</h1>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}
            <input 
              type="email" 
              placeholder="Email" 
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
            <input 
              type="password"
              placeholder="Password" 
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            <a 
              href="#" 
              className="forgot-password" 
              onClick={handleForgotPasswordClick}
              style={{ position: 'relative', zIndex: 100 }}
            >
              Forgot your password?
            </a>
            <button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Forgot Password Form Container */}
        <div className="form-container forgot-password-container" ref={forgotPasswordFormRef}>
          <form onSubmit={handleForgotPasswordSubmit}>
            <h1>Forgot Password</h1>
            <p className="forgot-password-description">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            <input 
              type="email" 
              placeholder="Email" 
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              required
            />
            <button type="submit">Send Reset Code</button>
            <a 
              href="#" 
              className="back-to-signin" 
              onClick={handleBackToSignIn}
              style={{ position: 'relative', zIndex: 1000, pointerEvents: 'auto' }}
            >
              Back to Sign In
            </a>
          </form>
        </div>

        {/* Overlay Container */}
        {!isForgotPassword && (
          <div className="overlay-container" ref={overlayContainerRef}>
            <div className="overlay" ref={overlayRef_internal}>
            <div className="overlay-panel overlay-left" ref={overlayPanelLeftRef}>
              <div className="overlay-brand">
                <h2 className="overlay-logo">DeReFund</h2>
                <div className="overlay-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" id="signIn" onClick={handleSignInClick}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right" ref={overlayPanelRightRef}>
              <div className="overlay-brand">
                <h2 className="overlay-logo">DeReFund</h2>
                <div className="overlay-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h1>Join DeReFund</h1>
              <p>Transparent Relief, Trusted Impact. Start making a difference today</p>
              <button className="ghost" id="signUp" onClick={handleSignUpClick}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;

