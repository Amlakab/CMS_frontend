'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Eye,
  EyeOff,
  User,
  Shield,
  Coffee,
  Utensils,
  Clock,
  Star,
  ChefHat,
  ShoppingBag,
  Truck,
  Bell
} from 'lucide-react';
import { 
  FaCoffee, 
  FaHamburger, 
  FaPizzaSlice, 
  FaIceCream, 
  FaAppleAlt, 
  FaShoppingBasket,
  FaLeaf,
  FaAward,
  FaBreadSlice,
  FaCookieBite
} from 'react-icons/fa';

// Import cafeteria-related images
const images = {
  cafeLogo: '/images/cafe-logo.png',
  cafeHero: '/images/cafe-hero.jpg',
  cafeInterior: '/images/cafe-interior.jpg',
  cafeFood: '/images/cafe-food.jpg',
  cafeTeam: '/images/cafe-team.jpg',
};

export default function LoginPage() {
  const { theme } = useTheme();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginWithOtp } = useAuth();
  const router = useRouter();

  // Theme styles with cafeteria colors
  const themeStyles = {
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #0a192f, #112240)' 
      : 'linear-gradient(135deg, #fef7ec, #ffffff)',
    textColor: theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]',
    primaryColor: theme === 'dark' ? 'text-[#ff8c42]' : 'text-[#ff8c42]', // Orange color for food theme
    secondaryColor: theme === 'dark' ? 'text-[#ff6b6b]' : 'text-[#ff6b6b]', // Red for food theme
    borderColor: theme === 'dark' ? 'border-[#ff8c42]' : 'border-[#ff8c42]',
    buttonBg: theme === 'dark' 
      ? 'border-[#ff8c42] text-[#ff8c42] hover:bg-[#ff8c42] hover:text-black' 
      : 'border-[#ff8c42] text-[#ff8c42] hover:bg-[#ff8c42] hover:text-white',
    cardBg: theme === 'dark' 
      ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] border-[#ff8c42]/30' 
      : 'bg-gradient-to-br from-white to-orange-50 border-[#ff8c42]/30',
    inputBg: theme === 'dark' 
      ? 'bg-[#0a192f] border-[#ff8c42]/50 text-white placeholder-gray-400 focus:ring-[#ff8c42]' 
      : 'bg-white border-[#ff8c42]/50 text-[#333333] focus:ring-[#ff8c42]'
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      let user;
      if (isOtpLogin) {
        user = await loginWithOtp(phone, otp);
      } else {
        user = await login(phone, password);
      }

      if (user && user.role) {
        toast.success('Login successful! Welcome back!', {
          position: 'top-right',
          autoClose: 2000,
        });

        // Role routing for cafeteria management
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setMessage('Login failed: User data is missing');
        toast.error('Login failed: User data is missing');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Login failed';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setMessage('Please enter your phone number');
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        setMessage('OTP sent to your phone');
        toast.success('OTP sent to your phone');
        setIsOtpLogin(true);
      } else {
        const error = await response.json();
        const errorMsg = error.message || 'Failed to send OTP';
        setMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = 'Failed to send OTP';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Cafeteria food categories
  const foodCategories = [
    { icon: <FaCoffee className="w-5 h-5" />, title: "Breakfast", description: "Morning specials", color: "amber" },
    { icon: <FaHamburger className="w-5 h-5" />, title: "Lunch", description: "Daily specials", color: "orange" },
    { icon: <FaPizzaSlice className="w-5 h-5" />, title: "Dinner", description: "Evening meals", color: "red" },
    { icon: <FaCookieBite className="w-5 h-5" />, title: "Snacks", description: "Quick bites", color: "yellow" },
    { icon: <FaIceCream className="w-5 h-5" />, title: "Desserts", description: "Sweet treats", color: "pink" },
    { icon: <FaAppleAlt className="w-5 h-5" />, title: "Healthy", description: "Nutritious options", color: "green" },
  ];

  // Cafeteria features
  const features = [
    { icon: <Clock className="w-5 h-5" />, title: "Fast Service", description: "Quick order processing" },
    { icon: <Leaf className="w-5 h-5" />, title: "Fresh Ingredients", description: "Locally sourced" },
    { icon: <Truck className="w-5 h-5" />, title: "Delivery", description: "Campus-wide delivery" },
    { icon: <ShoppingBag className="w-5 h-5" />, title: "Online Orders", description: "Order ahead online" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeStyles.background} ${theme === 'dark' ? 'text-white' : 'text-[#333333]'}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          id="login-form"
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-4xl md:text-5xl font-bold mb-4 ${themeStyles.primaryColor}`}
            >
              Campus Café Login
            </motion.h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#555555]'} max-w-2xl mx-auto`}>
              Access your cafeteria account to order food, track deliveries, and manage your preferences.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Login Form Card */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`rounded-2xl shadow-2xl p-8 border ${themeStyles.cardBg}`}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-[#ff8c42]/20' : 'bg-[#ff8c42]/10'}`}>
                  <Utensils className={`w-8 h-8 ${themeStyles.primaryColor}`} />
                </div>
                <h2 className={`text-2xl font-bold ${themeStyles.primaryColor}`}>
                  Cafeteria Login
                </h2>
              </div>

              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Sign in to order food, check your meal plan, or manage your account.
              </p>

              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mb-6 p-4 rounded-lg ${
                    message.includes('sent') || message.includes('success')
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  } ${theme === 'dark' ? 'bg-opacity-20' : ''}`}
                >
                  {message}
                </motion.div>
              )}

              <form className="space-y-6" onSubmit={handleLogin}>
                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-700'}`}
                  >
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} sm:text-sm`}>+251</span>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className={`w-full pl-16 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${themeStyles.inputBg}`}
                      placeholder="912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password or OTP */}
                {!isOtpLogin ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="password"
                        className={`block text-sm font-medium ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-700'}`}
                      >
                        Password *
                      </label>
                      <Link
                        href="/forgot-password"
                        className={`text-xs ${themeStyles.primaryColor} hover:underline`}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 pr-12 ${themeStyles.inputBg}`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className={`absolute inset-y-0 right-3 flex items-center ${
                          theme === 'dark' ? 'text-gray-400 hover:text-[#ff8c42]' : 'text-gray-500 hover:text-[#ff8c42]'
                        }`}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="otp"
                      className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-700'}`}
                    >
                      OTP Code *
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${themeStyles.inputBg}`}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <p className="text-xs mt-1 text-gray-500">
                      We've sent a one-time password to your phone
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-[#ff8c42] to-[#ff6b6b] text-black hover:opacity-90'
                      : 'bg-gradient-to-r from-[#ff8c42] to-[#ff6b6b] text-white hover:opacity-90'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                          3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in to Your Account'
                  )}
                </button>

                {/* OTP Option */}
                {!isOtpLogin && (
                  <div className="pt-4 border-t border-gray-700/30">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className={`w-full px-6 py-3 border-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.buttonBg}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Bell className="w-4 h-4" />
                        Login with OTP
                      </div>
                    </button>
                  </div>
                )}
              </form>

              {/* Register Link */}
              <div className="mt-8 pt-6 border-t border-gray-700/30">
                <p className={`text-center ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-600'} text-sm`}>
                  New to Campus Café?{' '}
                  <Link
                    href="/auth/register"
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-[#ff8c42] hover:text-orange-300' : 'text-[#ff8c42] hover:text-orange-600'
                    } transition duration-200`}
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Cafeteria Features Section */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Cafeteria Image */}
              <div className={`rounded-2xl overflow-hidden shadow-2xl ${themeStyles.cardBg} border`}>
                <div className="relative h-64">
                  <Image
                    src={images.cafeInterior || '/api/placeholder/600/300'}
                    alt="Campus Café Interior"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className={`absolute inset-0 ${
                    theme === 'dark' ? 'bg-black/40' : 'bg-black/20'
                  }`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <h3 className={`text-2xl font-bold mb-2 ${themeStyles.primaryColor}`}>
                        Welcome to Campus Café
                      </h3>
                      <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                        Fresh food, friendly service, campus-wide delivery
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Categories */}
              <div className={`rounded-2xl shadow-xl p-6 ${themeStyles.cardBg} border`}>
                <h3 className={`text-xl font-bold mb-6 ${themeStyles.primaryColor}`}>
                  Our Menu Categories
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {foodCategories.map((category, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`p-3 rounded-xl text-center ${
                        theme === 'dark' 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : 'bg-orange-50 hover:bg-orange-100'
                      } transition-colors duration-300`}
                    >
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                        theme === 'dark' ? 'bg-[#ff8c42]/20' : 'bg-[#ff8c42]/10'
                      }`}>
                        <span className={themeStyles.primaryColor}>
                          {category.icon}
                        </span>
                      </div>
                      <div className="text-sm font-medium truncate">
                        {category.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {category.description}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cafeteria Features */}
              <div className={`rounded-2xl shadow-xl p-6 ${themeStyles.cardBg} border`}>
                <h3 className={`text-xl font-bold mb-6 ${themeStyles.primaryColor}`}>
                  Why Choose Campus Café?
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg flex items-start gap-3 ${
                        theme === 'dark' 
                          ? 'bg-white/5' 
                          : 'bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#ff8c42]/20' : 'bg-[#ff8c42]/10'}`}>
                        <span className={themeStyles.primaryColor}>
                          {feature.icon}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{feature.title}</div>
                        <div className="text-xs text-gray-500">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Access */}
              <div className={`rounded-2xl shadow-xl p-6 ${themeStyles.cardBg} border`}>
                <h3 className={`text-xl font-bold mb-4 ${themeStyles.primaryColor}`}>
                  Quick Access
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/menu"
                    className={`p-4 rounded-xl text-center transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-[#ff8c42]/10 hover:bg-[#ff8c42]/20 border border-[#ff8c42]/30'
                        : 'bg-[#ff8c42]/10 hover:bg-[#ff8c42]/20 border border-[#ff8c42]/30'
                    }`}
                  >
                    <div className={`font-semibold ${themeStyles.primaryColor}`}>View Menu</div>
                    <div className="text-xs mt-1 opacity-75">Browse our delicious options</div>
                  </Link>
                  <Link
                    href="/about"
                    className={`p-4 rounded-xl text-center transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <div className="font-semibold">About Us</div>
                    <div className="text-xs mt-1 opacity-75">Our story & values</div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Opening Hours */}
          <div className={`mt-12 p-6 rounded-2xl ${themeStyles.cardBg} border`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  theme === 'dark' ? 'bg-[#ff8c42]/20' : 'bg-[#ff8c42]/10'
                }`}>
                  <Clock className={`w-6 h-6 ${themeStyles.primaryColor}`} />
                </div>
                <h4 className={`font-bold mb-2 ${themeStyles.primaryColor}`}>Opening Hours</h4>
                <p className="text-sm text-gray-500">
                  Mon-Fri: 7AM - 8PM<br />
                  Sat-Sun: 8AM - 6PM
                </p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  theme === 'dark' ? 'bg-[#ff8c42]/20' : 'bg-[#ff8c42]/10'
                }`}>
                  <Truck className={`w-6 h-6 ${themeStyles.primaryColor}`} />
                </div>
                <h4 className={`font-bold mb-2 ${themeStyles.primaryColor}`}>Delivery Hours</h4>
                <p className="text-sm text-gray-500">
                  Daily: 10AM - 9PM<br />
                  Campus-wide delivery
                </p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  theme === 'dark' ? 'bg-[#ff8c42]/20' : 'bg-[#ff8c42]/10'
                }`}>
                  <Phone className={`w-6 h-6 ${themeStyles.primaryColor}`} />
                </div>
                <h4 className={`font-bold mb-2 ${themeStyles.primaryColor}`}>Contact Us</h4>
                <p className="text-sm text-gray-500">
                  (123) 456-7890<br />
                  info@campuscafe.edu
                </p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-8 text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              By signing in, you agree to our{' '}
              <Link
                href="/terms-of-service"
                className={`${theme === 'dark' ? 'text-[#ff8c42]' : 'text-[#ff8c42]'} hover:underline`}
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy-policy"
                className={`${theme === 'dark' ? 'text-[#ff8c42]' : 'text-[#ff8c42]'} hover:underline`}
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

// Add Phone icon component
function Phone(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );
}

// Add Leaf icon component
function Leaf(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
    </svg>
  );
}