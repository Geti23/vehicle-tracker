import { prisma } from '@/lib/prisma'
import { updateServiceRecord } from '@/app/actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EditService({ 
  params 
}: { 
  params: Promise<{ id: string, serviceId: string }> 
}) {
  const resolvedParams = await params
  const vehicleId = resolvedParams.id
  const serviceId = resolvedParams.serviceId

  const service = await prisma.serviceRecord.findUnique({
    where: { id: serviceId }
  })

  if (!service) {
    redirect(`/vehicle/${vehicleId}`)
  }

  // Format the date so the HTML input can read it properly (YYYY-MM-DD)
  const formattedDate = service.date.toISOString().split('T')[0]

  const INPUT_STYLES = "w-full p-4 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition duration-150 ease-in-out"

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <Link href={`/vehicle/${vehicleId}`} className="text-blue-600 hover:underline mb-8 inline-flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Cancel Edit
        </Link>

        <h1 className="text-3xl font-extrabold mb-8 text-gray-950 tracking-tight">
          Edit Service Record
        </h1>

        <section className="bg-blue-50 p-8 rounded-xl border border-blue-100 shadow-inner">
          <form action={updateServiceRecord} className="flex flex-col gap-5">
            <input type="hidden" name="id" value={service.id} />
            <input type="hidden" name="vehicleId" value={vehicleId} />
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1.5">Date of Service</label>
                <input type="date" name="date" defaultValue={formattedDate} required className={INPUT_STYLES} />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1.5">Service Type</label>
                <input type="text" name="serviceType" defaultValue={service.serviceType} required className={INPUT_STYLES} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1.5">Mileage at Service</label>
                <input type="number" name="mileageAtService" defaultValue={service.mileageAtService} required className={INPUT_STYLES} />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1.5">Total Cost (€)</label>
                <input type="number" step="0.01" name="cost" defaultValue={service.cost !== null ? service.cost : ''} className={INPUT_STYLES} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1.5">Shop Name</label>
              <input type="text" name="shopName" defaultValue={service.shopName || ''} className={INPUT_STYLES} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1.5">Notes</label>
              <textarea name="description" defaultValue={service.description || ''} className={`${INPUT_STYLES} h-32`}></textarea>
            </div>
            
            <button type="submit" className="bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md w-full mt-4">
              Update Service Record
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}