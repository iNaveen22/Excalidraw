'use client';
import Link from "next/link";
import { Button } from '@repo/ui/button';
import { Pencil, Users, Download, Zap, Lock, Layers, Github, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
            <span className="text-2xl font-bold text-gray-900">DrawFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition">About</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href={"/signin"}>
              <Button variant='Outlined' size='md'>
                SIGN IN
              </Button>
            </Link>
            <Link href={"/signup"}>
              <Button variant='Primary' size='md' children='SIGN UP' className='rounded-lg font-medium px-6 py-2' />
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-20">
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                Free & Open Source
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Sketch diagrams that feel{' '}
              <span className="text-blue-600">hand-drawn</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              A collaborative virtual whiteboard for creating beautiful diagrams, wireframes, and illustrations. Simple, powerful, and free forever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={"/room"}>
              <Button variant='Primary' size='lg' className='flex items-center gap-2 rounded-lg font-semibold px-8 py-4'>
                Start Drawing <ArrowRight className="w-5 h-5" /> 
              </Button>
              </Link>
              <Button variant='Outlined' size='lg' className='border-2 border-gray-300 text-gray-700 flex items-center gap-2 rounded-lg font-semibold px-8 py-4'>
                <Github className="w-5 h-5" />  
                View on GitHub
              </Button>
            </div>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/10 blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 shadow-2xl">
              <div className="bg-white rounded-lg p-12 min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="flex justify-center gap-4 flex-wrap">
                    <div className="w-32 h-32 border-4 border-gray-800 rounded-lg transform rotate-3"></div>
                    <div className="w-32 h-32 bg-blue-100 border-4 border-blue-600 rounded-full transform -rotate-6"></div>
                    <div className="w-32 h-32 border-4 border-green-600 transform rotate-12 flex items-center justify-center">
                      <div className="w-20 h-20 border-4 border-green-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-8">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-500 font-medium">Interactive Demo Canvas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-gray-50 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything you need to create
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features wrapped in a simple, intuitive interface
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Pencil className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hand-drawn Style</h3>
                <p className="text-gray-600">
                  Create diagrams with a unique sketchy, hand-drawn feel that makes your work stand out.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Collaboration</h3>
                <p className="text-gray-600">
                  Work together with your team in real-time. See cursors and changes as they happen.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Anywhere</h3>
                <p className="text-gray-600">
                  Export your diagrams as PNG, SVG, or clipboard. Share them anywhere you need.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Built for speed. No lag, no waiting. Start drawing immediately with zero friction.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-gray-600">
                  Your data stays yours. End-to-end encryption for all collaborative sessions.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Rich Library</h3>
                <p className="text-gray-600">
                  Access thousands of shapes, icons, and templates to jumpstart your creativity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 md:p-20 text-center text-white shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to start creating?
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
                Join thousands of designers, developers, and teams using DrawFlow every day.
              </p>
              {/* <button className="bg-white text-blue-600 px-10 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                Get Started for Free
                <ArrowRight className="w-5 h-5" />
              </button> */}
              <Button variant='Underlined' size='lg' className='inline-flex items-center gap-2 rounded-lg font-semibold px-10 py-4 shadow-lg hover:shadow-xl'>
                Get Started for Free 
                <ArrowRight className="w-5 h-5" />  
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pencil className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold text-white">DrawFlow</span>
              </div>
              <p className="text-sm">
                The collaborative whiteboard for teams that create together.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2024 DrawFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
