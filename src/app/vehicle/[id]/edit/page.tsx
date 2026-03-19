import { prisma } from '@/lib/prisma'
import { updateVehicle } from '@/app/actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EditVehicle({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params
  const vehicleId = resolvedParams.id

  // Fetch the existing vehicle data so we can pre-fill the form
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  })

  // If someone types a random ID in the URL, send them back home
  if (!vehicle) {
    redirect('/')
  }

  const INPUT_STYLES = "w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition duration-150 ease-in-out"

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Cancel Edit
        </Link>

        <h1 className="text-3xl font-extrabold mb-8 text-gray-950 tracking-tight">
          Edit Vehicle Details
        </h1>

        <section className="bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-inner">
          <form action={updateVehicle} className="flex flex-col gap-5">
            {/* Hidden ID so the backend knows WHICH vehicle to update */}
            <input type="hidden" name="id" value={vehicle.id} />

            {/* Notice we use defaultValue here to pre-fill the inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Make</label>
              <input type="text" name="make" defaultValue={vehicle.make} required className={INPUT_STYLES} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
              <input type="text" name="model" defaultValue={vehicle.model} required className={INPUT_STYLES} />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                <input type="number" name="year" defaultValue={vehicle.year} required className={INPUT_STYLES} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Mileage</label>
                <input type="number" name="currentMileage" defaultValue={vehicle.currentMileage} required className={INPUT_STYLES} />
              </div>
            </div>

            <button type="submit" className="bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md w-full mt-4">
              Save Changes
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}