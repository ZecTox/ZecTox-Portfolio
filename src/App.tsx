import React, { useState } from 'react';
import { Menu, Github, Linkedin, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const [aboutRef, aboutInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full top-0 z-50 bg-white shadow-md backdrop-blur-sm bg-opacity-90"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Portfolio
              </span>
            </motion.div>
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              {['About', 'Experience', 'Projects', 'Contact'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
            <div className="sm:hidden flex items-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-gray-900"
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
              className="sm:hidden bg-white"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {['About', 'Education', 'Experience', 'Projects', 'Contact'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    whileHover={{ x: 10 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* About Section */}
      <section id="about" className="pt-32 pb-20 bg-white">
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
                src="https://raw.githubusercontent.com/bolt-design-system/images/main/images/profile.jpg"
                alt="Profile"
                className="rounded-full w-64 h-64 object-cover mx-auto shadow-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="w-full md:w-2/3 text-center md:text-left"
            >
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">About Me</h2>
              <p className="text-lg text-gray-600">
                I'm a Shopify developer with 1+ Year of experience. During this time, I've gained a strong understanding of the Shopify dashboard, managing product listings, and using the Shopify theme editor to customize store designs. I'm also skilled in integrating various Shopify apps to enhance store functionality and improve the overall user experience. Additionally, I have a decent knowledge of custom theme development, allowing me to create more tailored solutions for clients. I'm dedicated to delivering efficient and user-friendly e-commerce solutions.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Education Section */}
      {/* <section id="education" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 sm:text-4xl text-center mb-12"
          >
            Education
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-lg p-8 transition-all duration-300"
          >
            <h3 className="text-xl font-semibold text-gray-900">B.Tech. in Computer Science and Engineering</h3>
            <p className="text-gray-600 mt-2">IIIT Dharwad</p>
          </motion.div>
        </div>
      </section> */}

      {/* Experience Section */}
      <section id="experience" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 sm:text-4xl text-center mb-12"
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
                className="bg-gray-50 rounded-lg p-8 shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900">{job.company}</h3>
                <p className="text-gray-600 mt-2">{job.role}</p>
                <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                  {job.tasks.map((task, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
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
      <section id="projects" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 sm:text-4xl text-center mb-12"
          >
            Shopify Stores
          </motion.h2>
          
          <div className="space-y-8">
            {[
              { name: 'Total Ingredients', url: 'https://total-ingredients.com/' },
              { name: 'Floaterz', url: 'https://floaterz.com/' },
              { name: 'Lovebomb', url: 'https://www.lovebomb.co.in/' },
              { name: 'Veloara Luxury', url: 'https://veloaraluxury.com/' },
              { name: 'Dang Shoes', url: 'https://www.dangshoes.com/' },
              { name: 'Silaye', url: 'https://silaye.in/' },
              { name: 'The Trianglemart', url: 'https://thetrianglemart.com/' },
            ].map((store, index) => (
              <motion.div
                key={store.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2 p-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{store.name}</h3>
                    <motion.a 
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-600 hover:text-blue-800 mb-4"
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
                  <div className="w-full md:w-1/2 p-6 bg-gray-50">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">My Contributions</h4>
                    <p className="text-gray-600">
                      [Your contributions for {store.name} will go here. Please add details about your specific role, implementations, improvements, and achievements for this project.]
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Skills Section */}
      <section id="technical-skills" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 sm:text-4xl text-center mb-12"
          >
            Technical Skills
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-50 rounded-lg p-8 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900">Programming Languages</h3>
              <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                {["C++", "Python", "HTML", "CSS", "JavaScript", "Shell scripting", "Selenium", "Git"].map((skill, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {skill}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-50 rounded-lg p-8 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900">Tools & Technologies</h3>
              <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                {["Shopify", "VS Code", "GitHub", "Jenkins", "Docker", "Kubernetes", "AWS", "VirtualBox", "Streamlit", "ChatGPT"].map((skill, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {skill}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-50 rounded-lg p-8 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900">Other Skills</h3>
              <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                {["Problem Solving", "Teamwork", "Collaboration", "Adaptability", "Time Management"].map((skill, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {skill}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section id="resume" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 sm:text-4xl text-center mb-12"
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
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 sm:text-4xl text-center mb-12"
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
                className="text-gray-700 hover:text-blue-600 transition-colors"
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
              className="text-gray-700 hover:text-blue-600 transition-colors font-semibold"
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
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-500"
          >
            © {new Date().getFullYear()} Portfolio. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </div>
  );
}

export default App;