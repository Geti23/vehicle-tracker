import { prisma } from '@/lib/prisma'
import { addVehicle, deleteVehicle } from './actions'
import Link from 'next/link' // <-- We added this

export default async function Home() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="max-w-3xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Vehicle Tracker</h1>

      <section className="bg-gray-100 p-6 rounded-lg mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add a New Vehicle</h2>
        <form action={addVehicle} className="flex flex-col gap-4">
          <input type="text" name="make" placeholder="Make (e.g. Toyota)" required className="p-3 border rounded text-black" />
          <input type="text" name="model" placeholder="Model (e.g. Tacoma)" required className="p-3 border rounded text-black" />
          <input type="number" name="year" placeholder="Year (e.g. 2018)" required className="p-3 border rounded text-black" />
          <input type="number" name="currentMileage" placeholder="Current Mileage" required className="p-3 border rounded text-black" />
          <button type="submit" className="bg-blue-600 text-white font-bold p-3 rounded hover:bg-blue-700 transition-colors">
            Save Vehicle
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">My Garage</h2>
        {vehicles.length === 0 ? (
          <p className="text-gray-500 italic">No vehicles added yet. Add your first one above!</p>
        ) : (
          <ul className="gap-4 flex flex-col">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all duration-200 ease-in-out flex flex-col sm:flex-row">
                {/* The Main Link */}
                <Link href={`/vehicle/${vehicle.id}`} className="block p-6 flex-grow group">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-xl text-blue-700 group-hover:text-blue-900 group-hover:underline">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                  <p className="text-gray-700 mt-2 font-medium">
                    Current Mileage: <span className="text-gray-900">{vehicle.currentMileage.toLocaleString('en-US')} km</span>
                  </p>
                </Link>
                
                {/* The Edit & Delete Buttons */}
                <div className="flex sm:flex-col border-t sm:border-t-0 sm:border-l border-gray-100">
                  <Link href={`/vehicle/${vehicle.id}/edit`} className="flex-1 px-6 py-3 sm:py-0 flex items-center justify-center text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    Edit
                  </Link>
                  <form action={deleteVehicle} className="flex-1 flex">
                    <input type="hidden" name="id" value={vehicle.id} />
                    <button type="submit" className="w-full px-6 py-3 sm:py-0 flex items-center justify-center text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors border-l sm:border-l-0 sm:border-t border-gray-100">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}