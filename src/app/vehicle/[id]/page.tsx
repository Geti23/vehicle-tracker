import { prisma } from '@/lib/prisma'
import { addServiceRecord, deleteServiceRecord } from '@/app/actions'
import Link from 'next/link'

export default async function VehicleDetails({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params
  const vehicleId = resolvedParams.id

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      services: {
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!vehicle) {
    return <div className="p-8 font-sans text-xl text-red-700 bg-red-50 min-h-screen">Vehicle not found.</div>
  }

  // --- Theme Constants (Ensure all inputs are light mode explicit) ---
  const INPUT_STYLES = "w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition duration-150 ease-in-out"

  return (
    // Explicitly set the overall page background and text
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Garage
        </Link>
        
        <div className="border-b border-gray-200 pb-6 mb-10">
          <h1 className="text-4xl font-extrabold text-gray-950 tracking-tight">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-gray-800 text-lg mt-2 font-medium">
            Current Mileage: {vehicle.currentMileage.toLocaleString('en-US')} km
          </p>
        </div>

        {/* --- Log New Service Form (Fixed Readability) --- */}
        <section className="bg-blue-50 p-8 rounded-xl mb-10 shadow-inner border border-blue-100">
          <h2 className="text-2xl font-semibold mb-6 text-blue-950">Log New Service Record</h2>
          <form action={addServiceRecord} className="flex flex-col gap-5">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1.5">Date of Service</label>
                <input type="date" name="date" required className={INPUT_STYLES} />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1.5">Service Type (e.g., Oil Change)</label>
                <input type="text" name="serviceType" placeholder="Oil Change, Inspection, etc." required className={INPUT_STYLES} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1.5">Mileage at Service (km)</label>
                <input type="number" name="mileageAtService" required className={INPUT_STYLES} />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1.5">Total Cost (€)</label>
                <input type="number" step="0.01" name="cost" placeholder="e.g. 59.99" className={INPUT_STYLES} />
              </div>
            </div>

            <input type="text" name="shopName" placeholder="Shop Name / Location (Optional)" className={INPUT_STYLES} />
            <textarea name="description" placeholder="Notes or Detailed Description (Optional)" className={`${INPUT_STYLES} h-32`}></textarea>
            
            <button type="submit" className="bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md w-full">
              Save Service Record
            </button>
          </form>
        </section>

        {/* --- Service History List --- */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Service History</h2>
          {vehicle.services.length === 0 ? (
            <p className="text-gray-500 italic p-6 bg-gray-100 rounded-lg text-center">No services logged for this vehicle yet. Log your first one above!</p>
          ) : (
            <ul className="gap-6 flex flex-col">
              {vehicle.services.map((service) => (
                <li key={service.id} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                        <h3 className="font-bold text-xl text-gray-950">{service.serviceType}</h3>
                        <span className="text-gray-600 font-medium">{service.date.toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 text-sm font-medium flex flex-wrap gap-4">
                        <span>Mileage: <span className="font-bold text-gray-900">{service.mileageAtService.toLocaleString('en-US')} km</span></span>
                        {service.cost !== null && <span> | Cost: <span className="font-bold text-gray-900">€{service.cost.toFixed(2)}</span></span>}
                        {service.shopName && <span> | Shop: <span className="font-bold text-gray-900">{service.shopName}</span></span>}
                        </p>
                        {service.description && (
                        <p className="text-gray-800 mt-4 bg-gray-50 p-4 rounded-lg text-sm border border-gray-100 leading-relaxed">
                            <span className="font-semibold text-gray-900 block mb-1">Notes:</span>
                            {service.description}
                        </p>
                        )}
                    </div>
                    
                    {/* The Edit & Delete Buttons */}
                    <div className="flex border-t border-gray-100 bg-gray-50">
                        <Link href={`/vehicle/${vehicle.id}/service/${service.id}/edit`} className="flex-1 p-3 text-center text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-100 transition-colors border-r border-gray-200">
                        Edit Record
                        </Link>
                        <form action={deleteServiceRecord} className="flex-1 flex">
                        <input type="hidden" name="id" value={service.id} />
                        <input type="hidden" name="vehicleId" value={vehicle.id} />
                        <button type="submit" className="w-full p-3 text-center text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-100 transition-colors">
                            Delete Record
                        </button>
                        </form>
                    </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}