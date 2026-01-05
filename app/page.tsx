'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { encryptionService } from '@/lib/encryptionUtils';
import { useTheme } from '@/lib/theme-context';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaMapMarker,
  FaPhone,
  FaEnvelope,
  FaArrowLeft,
  FaArrowRight,
  FaUtensils,
  FaCoffee,
  FaHamburger,
  FaPizzaSlice,
  FaIceCream,
  FaShoppingCart,
  FaClock,
  FaStar,
  FaFire,
  FaLeaf,
} from 'react-icons/fa';
import api from '@/app/utils/api';

// Import images for cafeteria
const images = {
  hero1: '/images/cafie1.jpeg',
  hero2: '/images/cafie2.jpeg',
  hero3: '/images/cafie3.jpeg',
  about: '/images/about1.png',
  services: '/images/cafie-services.jpg',
  contact: '/images/cafie-contact.jpg',
  logo: '/images/cafie-logo.png',
  food1: '/images/food1.jpg',
  food2: '/images/food2.jpg',
  food3: '/images/food3.jpg',
};

// Interface for Food (from your food page)
interface Food {
  _id: string;
  name: string;
  description: string;
  image?: string;
  category: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'DRINK' | 'SNACK';
  price: number;
  view: number;
  quantity_available: boolean;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  created_at: string;
  updated_at: string;
  imageData?: {
    contentType: string;
    fileName: string;
    dataUrl?: string;
  };
}

// Interface for Contact Form
interface ContactFormData {
  phone: string;
  email: string;
  name: string;
  subject: string;
  message: string;
}

// Slides data for cafeteria
const slides = [
  {
    image: images.hero1,
    title: "Welcome to Campus Café",
    description: "Fresh, delicious meals served daily with love and care.",
  },
  {
    image: images.hero2,
    title: "Daily Specials",
    description: "Experience our chef's special creations made from fresh ingredients.",
  },
  {
    image: images.hero3,
    title: "Cozy Atmosphere",
    description: "Perfect place to study, work, or relax with friends.",
  },
  {
    image: images.hero1,
    title: "Healthy Options",
    description: "Nutritious meals for a balanced lifestyle.",
  },
  {
    image: images.hero2,
    title: "Fast & Friendly Service",
    description: "Quick service without compromising on quality.",
  },
];

// Categories for food
const categories = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: <FaCoffee /> },
  { value: 'LUNCH', label: 'Lunch', icon: <FaUtensils /> },
  { value: 'DINNER', label: 'Dinner', icon: <FaHamburger /> },
  { value: 'DRINK', label: 'Drinks', icon: <FaCoffee /> },
  { value: 'SNACK', label: 'Snacks', icon: <FaIceCream /> },
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [featuredFoods, setFeaturedFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const { theme } = useTheme();
  
  // Contact form state
  const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001/api';
  const [formData, setFormData] = useState<ContactFormData>({
    phone: '',
    email: '',
    name: '',
    subject: 'Cafeteria Website Contact',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get API URL from environment or use relative path
  const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
      // Client-side: use current origin
      return window.location.origin.replace('3000', '3001');
    }
    // Server-side fallback
    return 'http://localhost:3001';
  };

  // CORRECTED: Get image URL - handles both local and production environments
  const getImageUrl = (food: Food): string | null => {
    if (!food) return null;
    
    // If imageData has dataUrl (base64), use it directly
    if (food.imageData?.dataUrl) {
      return food.imageData.dataUrl;
    }
    
    // If image field is a base64 string, use it directly
    if (food.image?.startsWith('data:image')) {
      return food.image;
    }
    
    // If image field is a URL, use it
    if (food.image?.startsWith('http')) {
      return food.image;
    }
    
    // If image field is a relative path, construct full URL
    if (food.image?.startsWith('/uploads')) {
      const baseUrl = getApiUrl();
      return `${baseUrl}${food.image}`;
    }
    
    // If image field exists but doesn't start with /uploads or http, assume it's a filename
    if (food.image) {
      const baseUrl = getApiUrl();
      return `${baseUrl}/uploads/foods/${food.image}`;
    }
    
    // If no image, return null
    return null;
  };

  // Get placeholder image
  const getPlaceholderImage = (text: string, color: string = '#007bff') => {
    // Create a simple placeholder using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = theme === 'dark' ? '#334155' : '#e5e7eb';
      ctx.fillRect(0, 0, 400, 250);
      ctx.fillStyle = color;
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.charAt(0).toUpperCase(), 200, 125);
    }
    return canvas.toDataURL();
  };

  // Format price function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  // Contact form handlers
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate that at least one contact method is provided
    if (!formData.phone && !formData.email) {
      toast.error('Please provide either a phone number or email address', {
        position: "top-right",
        autoClose: 3000,
        theme: theme === 'dark' ? 'dark' : 'light',
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Message sent successfully! We will get back to you soon.', {
          position: "top-right",
          autoClose: 3000,
          theme: theme === 'dark' ? 'dark' : 'light',
        });
        
        // Reset form
        setFormData({
          phone: '',
          email: '',
          name: '',
          subject: 'Cafeteria Website Contact',
          message: ''
        });
      } else {
        toast.error(`Error: ${result.error || 'Failed to send message'}`, {
          position: "top-right",
          autoClose: 3000,
          theme: theme === 'dark' ? 'dark' : 'light',
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Network error. Please check your connection and try again.', {
        position: "top-right",
        autoClose: 3000,
        theme: theme === 'dark' ? 'dark' : 'light',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch 3 featured foods (most viewed or newest)
  useEffect(() => {
    const fetchFeaturedFoods = async () => {
      try {
        setLoadingFoods(true);
        const params = new URLSearchParams({
          limit: '3',
          sortBy: 'view',
          sortOrder: 'desc',
          status: 'AVAILABLE'
        });
        
        const response = await api.get(`/foods/public/available?${params}`);
        setFeaturedFoods(response.data.data.foods || []);
      } catch (error) {
        console.error('Error fetching featured foods:', error);
        setFeaturedFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    };

    fetchFeaturedFoods();
  }, []);

  // Handle URL parameters (keep existing logic)
  useEffect(() => {
    const handleUrlParams = async () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const encryptedId = urlParams.get('agent_id');
        const agentId = encryptedId ? await encryptionService.decryptId(encryptedId) : null;
        const tgId = urlParams.get('tg_id');
        
        if (agentId || tgId) {
          const currentStorage = {
            agent_id: localStorage.getItem('agent_id'),
            tg_id: localStorage.getItem('tg_id')
          };
          
          if (agentId && agentId !== currentStorage.agent_id) {
            localStorage.setItem('agent_id', agentId);
          }
          
          if (tgId && tgId !== currentStorage.tg_id) {
            localStorage.setItem('tg_id', tgId);
          }
        }
      }
    };

    handleUrlParams();
  }, []);

  // Slideshow navigation
  const nextImage = useCallback(() => {
    setSlideDirection("right");
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const prevImage = useCallback(() => {
    setSlideDirection("left");
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentImageIndex, nextImage]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-background text-text-primary'
    }`}>
      <Navbar />
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
      
      <div className="pt-16">
        {/* Hero Section with Slideshow - Same as before */}
        <section className="relative h-screen overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ x: slideDirection === "right" ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slideDirection === "right" ? "-100%" : "100%", opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={slides[currentImageIndex].image}
                alt={slides[currentImageIndex].title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className={`absolute inset-0 ${
                theme === 'dark' ? 'bg-black/60' : 'bg-black/50'
              }`}></div>
            </motion.div>
          </AnimatePresence>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ x: slideDirection === "right" ? 100 : -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: slideDirection === "right" ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl"
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                  {slides[currentImageIndex].title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90">
                  {slides[currentImageIndex].description}
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/menu"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium text-lg transition-colors duration-300 shadow-lg"
                  >
                    View Our Menu
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full ${
              theme === 'dark' 
                ? 'bg-surface/80 hover:bg-surface' 
                : 'bg-white/80 hover:bg-white'
            } transition-all duration-300`}
            aria-label="Previous Image"
          >
            <FaArrowLeft className={theme === 'dark' ? 'text-text-primary' : 'text-text-primary'} size={20} />
          </button>
          <button
            onClick={nextImage}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full ${
              theme === 'dark' 
                ? 'bg-surface/80 hover:bg-surface' 
                : 'bg-white/80 hover:bg-white'
            } transition-all duration-300`}
            aria-label="Next Image"
          >
            <FaArrowRight className={theme === 'dark' ? 'text-text-primary' : 'text-text-primary'} size={20} />
          </button>
        </section>

        {/* About Section - Same as before */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-transparent' : 'bg-background'}`}>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-xl"
              >
                <Image
                  src={images.about}
                  alt="About Campus Café"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  About Campus Café
                </h2>
                <p className={`mb-6 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                  Welcome to <strong className="text-orange-500">Campus Café</strong>, your favorite spot on campus for delicious food, 
                  refreshing drinks, and a cozy atmosphere. Since 2010, we've been serving students, 
                  faculty, and staff with fresh, quality meals made from locally sourced ingredients.
                </p>
                <p className={`mb-6 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                  Our mission is to provide nutritious, affordable, and tasty food options that 
                  fuel your academic success while creating a welcoming community space.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center px-6 py-3 border-2 border-orange-500 hover:bg-orange-500 text-orange-500 hover:text-white rounded-lg font-medium transition-colors duration-300 text-base"
                >
                  Learn More About Us
                  <span className="ml-2">→</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Section - Same as before */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-surface/20' : 'bg-surface'}`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
              Our Food Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.value}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                  }`}>
                    <div className="text-2xl text-orange-500">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                    {category.label}
                  </h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Foods Section - UPDATED with corrected image handling */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-transparent' : 'bg-background'}`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
              Today's Specials
            </h2>
            
            {loadingFoods ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : featuredFoods.length === 0 ? (
              <div className="text-center py-12">
                <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>
                  <FaUtensils />
                </div>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                  No specials available today. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredFoods.map((food, index) => {
                  const imageUrl = getImageUrl(food);
                  const placeholder = getPlaceholderImage(food.name, theme === 'dark' ? '#00ffff' : '#007bff');
                  
                  return (
                    <motion.div
                      key={food._id}
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                        theme === 'dark' ? 'bg-surface/30 backdrop-blur-sm' : 'bg-surface'
                      }`}
                    >
                      <Link href="/menu" className="block">
                        {/* Food Image - UPDATED with corrected image handling */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={imageUrl || placeholder}
                            alt={food.name}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.3s'
                            }}
                            className="group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = placeholder;
                            }}
                          />
                          {/* Category Badge */}
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 text-xs font-bold ${
                              theme === 'dark' 
                                ? 'bg-gray-800 text-gray-300' 
                                : 'bg-gray-100 text-gray-600'
                            } rounded`}>
                              {getCategoryLabel(food.category)}
                            </span>
                          </div>
                          {/* Popular Badge */}
                          {food.view > 50 && (
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 text-xs font-bold bg-yellow-500 text-gray-900 rounded flex items-center gap-1">
                                <FaFire size={10} /> Popular
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className={`text-lg font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-text-primary'
                            }`}>
                              {food.name}
                            </h3>
                            <span className={`text-lg font-bold ${
                              theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                            }`}>
                              {formatPrice(food.price)}
                            </span>
                          </div>
                          <p className={`text-base mb-3 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
                          }`}>
                            {food.description.length > 100 
                              ? `${food.description.substring(0, 100)}...` 
                              : food.description}
                          </p>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center">
                                <FaStar className="text-yellow-500 mr-1" />
                                <span className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {food.view} views
                                </span>
                              </div>
                              <div className={`flex items-center ${
                                food.quantity_available 
                                  ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                  : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                              }`}>
                                <div className={`w-2 h-2 rounded-full mr-1 ${
                                  food.quantity_available 
                                    ? theme === 'dark' ? 'bg-green-400' : 'bg-green-600'
                                    : theme === 'dark' ? 'bg-red-400' : 'bg-red-600'
                                }`}></div>
                                <span className="text-sm">
                                  {food.quantity_available ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                // Handle quick order
                                window.location.href = `/menu?food=${food._id}`;
                              }}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                theme === 'dark'
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                  : 'bg-orange-500 hover:bg-orange-600 text-white'
                              } transition-colors duration-300 flex items-center gap-1`}
                            >
                              <FaShoppingCart size={12} /> Order
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
            <div className="text-center mt-12">
              <Link
                href="/menu"
                className="inline-flex items-center px-6 py-3 border-2 border-orange-500 hover:bg-orange-500 text-orange-500 hover:text-white rounded-lg font-medium transition-colors duration-300 text-base"
              >
                View Full Menu
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section - Same as before */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-surface/20' : 'bg-surface'}`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 dark:bg-orange-500/20 mb-4">
                  <FaLeaf className="text-orange-500 text-xl" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  Fresh Ingredients
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}>
                  We use only the freshest, locally sourced ingredients in all our meals.
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 dark:bg-orange-500/20 mb-4">
                  <FaClock className="text-orange-500 text-xl" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  Quick Service
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}>
                  Get your food quickly so you can get back to studying or relaxing.
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 dark:bg-orange-500/20 mb-4">
                  <FaStar className="text-orange-500 text-xl" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  Quality Guarantee
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}>
                  We stand behind the quality of every meal we serve.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section - Same as before */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-transparent' : 'bg-background'}`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
              Visit Us Today
            </h2>
            
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 dark:bg-orange-500/20 mb-4">
                  <FaMapMarker className="text-orange-500 text-xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  Location
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}>
                  Main Campus Building A<br />
                  Student Center, 1st Floor
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 dark:bg-orange-500/20 mb-4">
                  <FaClock className="text-orange-500 text-xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  Hours
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}>
                  Mon-Fri: 7:00 AM - 8:00 PM<br />
                  Sat-Sun: 8:00 AM - 6:00 PM
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 dark:bg-orange-500/20 mb-4">
                  <FaPhone className="text-orange-500 text-xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  Contact
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}>
                  (123) 456-7890<br />
                  info@campuscafe.edu
                </p>
              </motion.div>
            </div>

            {/* Map and Contact Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Map */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="rounded-xl overflow-hidden shadow-xl"
              >
                <div className="h-96">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215209132579!2d-73.98784468459363!3d40.75797897932689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1648062964726!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                  Have Questions?
                </h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'}`}>
                  Send us a message and we'll get back to you as soon as possible.
                </p>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleContactChange}
                        className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ${
                          theme === 'dark' 
                            ? 'bg-surface/50 border-border text-white placeholder-gray-400' 
                            : 'bg-background border-border text-text-primary'
                        }`}
                        placeholder="Full Name *"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        id="contact"
                        name="contact"
                        value={formData.email || formData.phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.includes('@')) {
                            setFormData({...formData, email: value, phone: ''});
                          } else {
                            setFormData({...formData, phone: value, email: ''});
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ${
                          theme === 'dark' 
                            ? 'bg-surface/50 border-border text-white placeholder-gray-400' 
                            : 'bg-background border-border text-text-primary'
                        }`}
                        placeholder="Email or Phone *"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleContactChange}
                      className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-surface/50 border-border text-white' 
                          : 'bg-background border-border text-text-primary'
                      }`}
                    >
                      <option value="">Select Subject *</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="account-issues">Account Issues</option>
                      <option value="payment-issues">Payment Issues</option>
                      <option value="game-suggestions">Game Suggestions</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleContactChange}
                      placeholder="Your Message *"
                      className={`w-full px-4 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-surface/50 border-border text-white placeholder-gray-400' 
                          : 'bg-background border-border text-text-primary'
                      }`}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 rounded-lg font-medium text-base transition-colors duration-300 flex items-center justify-center ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-16 px-4 ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-orange-50 to-red-50'}`}>
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                Ready to Order?
              </h2>
              <p className={`text-xl mb-8 max-w-2xl mx-auto ${
                theme === 'dark' ? 'text-gray-300' : 'text-text-secondary'
              }`}>
                Browse our full menu, place an order online, or visit us in person for a delicious meal today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/menu"
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium text-lg transition-colors duration-300 shadow-lg"
                >
                  Order Online
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-3 border-2 border-orange-500 hover:bg-orange-500 text-orange-500 hover:text-white rounded-lg font-medium text-lg transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}