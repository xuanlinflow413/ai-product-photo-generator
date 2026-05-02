"use client";

export default function BeforeAfter() {
  return (
    <section className="w-full py-16 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            See the Difference
          </h2>
          <p className="text-gray-600">
            See the difference AI can make for your listings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              Before: Your original product photo
            </div>
            <img
              src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=400&fit=crop"
              alt="Original product photo"
              className="w-full h-64 object-cover"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              After: AI-enhanced product photo preview
            </div>
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop"
              alt="AI enhanced product photo"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
