import React from 'react';

export function About() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">SOBRE FORTISOL</h1>
          <div className="w-24 h-1 bg-black mx-auto"></div>
        </div>

        <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
          <p className="text-2xl font-medium text-black text-center mb-12">
            FORTISOL® Es una empresa que elabora y distribuye suplementos nutricionales y productos de belleza.
          </p>

          <div className="bg-gray-50 p-8 md:p-12 mb-12 border-l-4 border-black">
            <p className="mb-0">
              Imagina un cuerpo lleno de vitalidad, articulaciones ágiles, y una energía que te impulsa a conquistar cada día. 
              Fortisol no es solo una marca Patentada, gracias a las fórmulas nutracéuticas, desarrolladas en nuestro propio 
              laboratorio y respaldadas por la certificación del Ministerio de Salud.
            </p>
          </div>

          <p className="mb-8">
            FORTISOL® te ofrece la garantía de productos auténticos, elaborados con ingredientes funcionales de la más alta 
            calidad, para que puedas disfrutar de resultados reales y visibles, por que
          </p>

          <p className="text-3xl font-black text-black text-center uppercase tracking-wider my-16">
            FORTISOL es salud para toda la vida..
          </p>
        </div>
      </div>
    </div>
  );
}
