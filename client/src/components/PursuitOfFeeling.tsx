import React from 'react';

/**
 * Pursuit of Feeling Section
 * Design: Left image (wide), right text (narrow), inspired by Black Tomato's layout
 * Features: Emotional travel philosophy, "Find out More" button, responsive layout
 */

export default function PursuitOfFeeling() {
  return (
    <section className="relative bg-[#F5F3EF] overflow-hidden">
      {/* Container with max-width and padding */}
      <div className="container max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Grid layout: image on left (full left half), text on right (narrow) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Image (1 column, fixed 800×450px) */}
          <div className="relative w-full h-full flex items-center justify-center order-2 md:order-1">
            <img
              src="https://private-us-east-1.manuscdn.com/sessionFile/rRG3fm5GFqocsddQOrSxiV/sandbox/bG7rJVbLwiLK7dsHpKL0t7-img-1_1770213061000_na1fn_cHVyc3VpdC1vZi1mZWVsaW5n.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvclJHM2ZtNUdGcW9jc2RkUU9yU3hpVi9zYW5kYm94L2JHN3JKVmJMd2lMSzdkc0hwS0wwdDctaW1nLTFfMTc3MDIxMzA2MTAwMF9uYTFmbl9jSFZ5YzNWcGRDMXZaaTFtWldWc2FXNW4uanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=MCHSgcssuLUqo1WqoxJhFlwKV60Nn8fgCn3l2eCTOHwAmMxB5i-IRmKwuqXwaygC-c0Zlw9rswlZPCtc2hMZCyJcYnoHkRJyyiJjq5m3W3eO7FhSkqXfZVDVON7S6xgZ~VAtpn18E4kkVdHs~cR0qvxP0l7z-h~4CJENKBy2v8bQ9HLTydVeTuwID5IG90LCYkRyMNb2iAfR6wo32mCnYCA348TyA2zjTuaEgYG1LNlO5yKFxEU27T9V-gHaDX-PJS7nTwT75riqQkyC7Q-nXhitc3a5eWdweiLTfJHT5b3xEgY~bRn-SAYHeZfvEfflWk~jjMZn-shf-oRiAWXAgg__"
              alt="Person experiencing emotional travel moment overlooking misty mountains"
              className="w-full max-w-[800px] h-auto object-cover"
              style={{ aspectRatio: '800/450' }}
            />
          </div>

          {/* Right: Text Content (1 column) */}
          <div className="flex flex-col justify-center order-1 md:order-2">
            {/* Main Title - using same font as body */}
            <h2 className="font-sans text-2xl md:text-3xl text-black mb-6 leading-tight uppercase tracking-wider font-semibold">
              Pursuit of Feeling
            </h2>

            {/* Body Text - Regular */}
            <div className="text-sm md:text-base text-gray-700 leading-relaxed font-sans mb-8 space-y-4">
              <p>
                Travel has always been about more than just going 'somewhere else'. For us, travel – breathless and beautiful – is about feeling somewhere else; a kind of emotional high that stays with you for the rest of your life.
              </p>
              <p>
                The Pursuit of Feeling – our brand-new collection of trips, features, and luxury travel experiences – bottles this soulful, sensual desire, taking us back to one of our founding philosophies:
              </p>
              <p className="italic font-medium">
                It's not where you want to go; it's how you want to feel.
              </p>
            </div>

            {/* Find out More Button - same style as Get In Touch */}
            <div>
              <button className="px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded hover:bg-[#F5F3EF] hover:text-black hover:border hover:border-black transition-colors duration-300">
                Find out More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
