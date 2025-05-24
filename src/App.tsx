import { useState, useEffect } from 'react';
import { Menu, Github, Linkedin, Mail, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-scroll';
import tejasImage from './image.png';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aboutRef, aboutInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const navItems = [
    'About',
    'Experience',
    'Projects',
    'Technical Skills',
    'Resume',
    'Contact'
  ];

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'dark animated-gradient-dark' : 'animated-gradient'}`}>
      {/* Animated Background Shapes */}
      <div className="shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Header/Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed w-full top-0 z-50 ${isDarkMode ? 'bg-gray-900/70' : 'bg-white/70'} shadow-lg backdrop-blur-md glass`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'text-yellow-400 hover:bg-gray-800/50' : 'text-gray-600 hover:bg-gray-100/50'} transition-all duration-300`}
              >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item}
                  to={item.toLowerCase().replace(/\s+/g, '-')}
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={100}
                  className={`cursor-pointer ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-all duration-300`}
                >
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.span>
                </Link>
              ))}
            </div>
            <div className="sm:hidden flex items-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`sm:hidden ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item}
                    to={item.toLowerCase().replace(/\s+/g, '-')}
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={100}
                    className={`block px-3 py-2 ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-all duration-300`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.span
                      whileHover={{ x: 10 }}
                    >
                      {item}
                    </motion.span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Content Sections */}
      <div className="relative z-10">
        {/* About Section */}
        <section id="about" className={`pt-32 pb-20 ${isDarkMode ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              ref={aboutRef}
              initial="initial"
              animate={aboutInView ? "animate" : "initial"}
              variants={staggerContainer}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <motion.div 
                variants={fadeInUp}
                className="w-full md:w-1/3"
              >
                <motion.img
                  src={tejasImage}
                  alt="Profile"
                  className="rounded-full w-64 h-64 object-cover object-top mx-auto"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className={`w-full md:w-2/3 text-center md:text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
              >
                {/* Main Name */}
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">Tejas Kedare</h2>

                {/* Role as subheading */}
                <p className={`text-base sm:text-lg mb-8 ${isDarkMode ? 'tex  t-gray-400' : 'text-gray-600'}`}>
                  Shopify Developer | DevOps Learner <span role="img" aria-label="cloud">☁️</span>
                </p>

                {/* "About Me" Heading */}
                <h3 className="text-2xl font-bold sm:text-3xl mb-6">About Me</h3>

                {/* Descriptive Paragraph */}
                <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  I'm a Shopify developer with 1+ Year of experience. During this time, I've gained a strong
                  understanding of the Shopify dashboard, managing product listings, and using the Shopify theme
                  editor to customize store designs. I'm also skilled in integrating various Shopify apps to enhance
                  store functionality and improve the overall user experience. Additionally, I have a decent knowledge
                  of custom theme development, allowing me to create more tailored solutions for clients. I'm dedicated
                  to delivering efficient and user-friendly e-commerce solutions.
                </p>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className={`py-20 ${isDarkMode ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-3xl font-bold sm:text-4xl text-center mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
            >
              Experience
            </motion.h2>
            
            <div className="space-y-8">
              {[
                {
                  company: "The Dhindora Club",
                  role: "Shopify Developer",
                  tasks: [
                    "Developed and maintained multiple eCommerce websites on Shopify ensuring high performance and user-friendly design",
                    "Led client onboarding, gathered project requirements, and provided regular updates on progress.",
                    "Served as the primary point of contact for clients, addressing their concerns and ensuring project alignment with business goals.",
                    "Delivered customized Shopify solutions, including theme development, app integrations, mobile/SEO optimization, and payment gateway integrations",
                    "Integrated shipping partners and third-party services to streamline order fulfillment and improve customer experience",
                    "Provided client training on managing and updating their Shopify stores",
                    "Offered post-launch support, ensuring smooth functionality and resolving any technical issues"
                  ]
                },
                {
                  company: "Pure Tru Herb Pvt Ltd",
                  role: "Shopify Developer",
                  tasks: [
                    "Managed and maintained the company's Shopify Store (www.total-ingredients.com), conducting regular tests to ensure functionality.",
                    "Oversaw 450+ products on the website, solely adding 200+ products to streamline updates and management",
                    "Developed a Certificate of Analysis (COA) Creator application to automate document generation",
                    "Built a sales data visualization app to enhance team decision-making with key metrics."
                  ]
                }
              ].map((job, index) => (
                <motion.div
                  key={job.company}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-lg p-8 shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} backdrop-blur-sm`}
                >
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{job.company}</h3>
                  <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{job.role}</p>
                  <ul className="mt-4 space-y-2 list-disc list-inside">
                    {job.tasks.map((task, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                      >
                        {task}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className={`py-20 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-3xl font-bold sm:text-4xl text-center mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
            >
              Shopify Stores
            </motion.h2>
            
            <div className="space-y-8">
              {[
                { 
                  name: 'Ratnaya Organics',
                  url: 'https://ratnayaorganics.com/',
                  contributions: [
                    "Sourced and customized the Shopify theme based on client requirements",
                    "Tailored theme design and functionality to align with brand identity",
                    "Implemented fully responsive layouts across devices",
                    "Set up product collections, advanced filters, and navigation",
                    "Managed the product listings",
                    "Integrated multiple third-party apps to enhance site functionality",
                    "Configured delivery estimator, bundle discount, and size chart applications for better user experience",
                    "Integrated Judge.me for customer reviews and Instafeed for Instagram feed on homepage",
                    "Enabled Razorpay for secure payment processing",
                    "Connected Shiprocket for streamlined order fulfillment and shipping",
                    "Created and structured the Terms & Policies section, including Privacy Policy, Refund Policy, Shipping Policy, Terms of Service, and Contact Information"
                  ]
                },
                { 
                  name: 'Total Ingredients',
                  url: 'https://total-ingredients.com/',
                  contributions: [
                    "Improved site performance by compressing and converting frequently used images to WebP format for faster loading.",
                    "Independently managed and maintained the entire Shopify store, overseeing all aspects of its operation and performance.",
                    "Independently managed and maintained the entire Shopify store, overseeing 450+ products and solely adding 250+ (Till now) new products to streamline updates and overall management.",
                    /* Space left to add points if i remembered*/
                  ]
                },
                { 
                  name: 'Floaterz',
                  url: 'https://floaterz.com/',
                  contributions: [
                    "Sourced and customized the Shopify theme based on client requirements",
                    "Tailored theme design and functionality to align with brand identity",
                    "Implemented fully responsive layouts across devices",
                    "Set up product collections, advanced filters, and navigation",
                    "Managed product listings, including 12 SKUs with multiple color variants",
                    "Integrated multiple third-party apps to enhance site functionality",
                    "Configured delivery estimator, bundle discount, and size chart applications for better user experience",
                    "Set up AVADA SEO for basic on-site search optimization",
                    "Integrated Judge.me for customer reviews and Instafeed for Instagram feed on homepage",
                    "Enabled Razorpay for secure payment processing",
                    "Connected Shiprocket for streamlined order fulfillment and shipping",
                    "Created and structured the Terms & Policies section, including Privacy Policy, Refund Policy, Shipping Policy, Terms of Service, and Contact Information"
                    /* Space left to add points if i remembered*/
                  ]                  
                },
                { 
                  name: 'Lovebomb',
                  url: 'https://www.lovebomb.co.in/',
                  contributions: [
                    "Customized the entire website using custom HTML and CSS where required, based on client specifications",
                    "Tailored the design and layout to suit a single-product website structure",
                    "Integrated multiple third-party applications to enhance functionality and user experience",
                    "Configured delivery estimator, bundle discount, and size chart applications for better user experience",
                    "Set up AVADA SEO for basic on-site search optimization",
                    "Integrated Judge.me for customer reviews and Instafeed for Instagram feed on homepage",
                    "Enabled Razorpay for secure payment processing",
                    "Connected Shiprocket for streamlined order fulfillment and shipping",
                    "Created and structured the Terms & Policies section, including Privacy Policy, Refund Policy, Shipping Policy, Terms of Service, and Contact Information"
                    /* Space left to add points if i remembered*/
                  ]                  
                },
                { 
                  name: 'Veloara Luxury',
                  url: 'https://veloaraluxury.com/',
                  contributions: [
                    "Sourced and implemented a GPL-licensed Shopify theme for the store",
                    "Designed and wrote homepage content tailored to the brand’s positioning",
                    "Listed 3 products with detailed descriptions and categorized them appropriately",
                    "Enabled Razorpay for secure payment processing",
                    "Connected Shiprocket for streamlined order fulfillment and shipping",
                    "Created and structured the Terms & Policies section, including Privacy Policy, Refund Policy, Shipping Policy, Terms of Service, and Contact Information"
                    /* Space left to add points if i remembered*/
                  ]                  
                },
                { 
                  name: 'Dang Shoes',
                  url: 'https://www.dangshoes.com/',
                  contributions: [
                    "Performed complete product listing with accurate categorization and tagging",
                    "Created and structured the Terms & Policies section, including Privacy Policy, Refund Policy, Shipping Policy, Terms of Service, and Contact Information"
                    /* Space left to add points if i remembered*/
                  ]                  
                },
                { 
                  name: 'Silaye',
                  url: 'https://silaye.in/',
                  contributions: [
                    "Implemented extensive customizations on the homepage using HTML, CSS, and JavaScript based on client requirements",
                    "Developed a product reel video carousel for the homepage to enhance visual engagement",
                    "Created a custom testimonial section with reviews and product images for added credibility",
                    "Performed detailed product listing corrections with proper categorization based on client-provided data",
                    "Configured GST settings for clothing by categorizing products according to pricing slabs",
                    "Customized the footer by editing theme files and added a custom background image"
                  ]                  
                },
                { 
                  name: 'The Trianglemart',
                  url: 'https://thetrianglemart.com/',
                  contributions: [
                    "Used the Dawn theme and customized the website extensively based on client requirements using Liquid templating",
                    "Added multiple custom sections using HTML, CSS, and JavaScript within Shopify’s custom HTML section blocks",
                    "Listed 2650+ products through mass import, ensuring proper structure and categorization",
                    "Implemented custom forms using Shopify Forms to gather user information and messages via the Contact Us page",
                    "Enabled Razorpay for secure and seamless payment processing",
                    "Integrated Shiprocket to automate order fulfillment and shipping logistics"
                  ]                  
                }
              ].map((store, index) => (
                <motion.div
                  key={store.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm`}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 p-6">
                      <h3 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{store.name}</h3>
                      <motion.a 
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-block mb-4 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                        whileHover={{ x: 5 }}
                      >
                        Visit Store →
                      </motion.a>
                      <img 
                        src={`https://api.microlink.io?url=${store.url}&screenshot=true&meta=false&embed=screenshot.url`}
                        alt={store.name}
                        className="w-full rounded-lg shadow-md"
                      />
                    </div>
                    <div className={`w-full md:w-1/2 p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                      <h4 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>My Contributions</h4>
                      <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {store.contributions.map((contribution, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{contribution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Skills Section */}
        <section id="technical-skills" className={`py-20 ${isDarkMode ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-3xl font-bold sm:text-4xl text-center mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
            >
              Technical Skills
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Programming Languages",
                  skills: ["C++", "Python", "HTML", "CSS", "JavaScript", "Shell scripting", "Selenium", "Git"]
                },
                {
                  title: "Tools & Technologies",
                  skills: ["Shopify", "VS Code", "GitHub", "Jenkins", "Docker", "Kubernetes", "AWS", "VirtualBox", "Streamlit", "ChatGPT"]
                },
                {
                  title: "Other Skills",
                  skills: ["Problem Solving", "Teamwork", "Collaboration", "Adaptability", "Time Management"]
                }
              ].map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-lg p-8 shadow-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} backdrop-blur-sm`}
                >
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{category.title}</h3>
                  <ul className="mt-4 space-y-2 list-disc list-inside">
                    {category.skills.map((skill, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                      >
                        {skill}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Resume Section */}
        <section id="resume" className={`py-10 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-3xl font-bold sm:text-4xl text-center mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
            >
              My Resume
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.a
                href="https://drive.google.com/file/d/1V6ddYTzHaPguGXG-7q7MP1I85N8Y3wVe/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Resume
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={`py-10 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-3xl font-bold sm:text-4xl text-center mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
            >
              Contact
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center space-x-8"
            >
              {[
                { icon: Github, href: "https://github.com/ZecTox" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/zectox/" },
                { icon: Mail, href: "mailto:tejaskedare.22@gmail.com" }
              ].map(({ icon: Icon, href }, index) => (
                <motion.a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Icon size={24} />
                </motion.a>
              ))}
              <motion.a
                href="https://www.fiverr.com/s/yvbQjx6"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-semibold ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
                whileHover={{ scale: 1.2, rotate: 5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Fiverr
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`${isDarkMode ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              © {new Date().getFullYear()} | All Rights Reserved | Made by Tejas Kedare
            </motion.p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;