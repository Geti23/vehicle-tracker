'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addVehicle(formData: FormData) {
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const year = parseInt(formData.get('year') as string)
  const currentMileage = parseInt(formData.get('currentMileage') as string)

  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' }
    })
  }

  await prisma.vehicle.create({
    data: {
      make,
      model,
      year,
      currentMileage,
      userId: user.id, 
    }
  })

  revalidatePath('/')
}

// --- NEW FUNCTION BELOW ---

export async function addServiceRecord(formData: FormData) {
  const vehicleId = formData.get('vehicleId') as string
  const serviceType = formData.get('serviceType') as string
  const mileageAtService = parseInt(formData.get('mileageAtService') as string)
  const date = new Date(formData.get('date') as string)
  
  // Optional fields
  const costInput = formData.get('cost')
  const cost = costInput ? parseFloat(costInput as string) : null
  const shopName = formData.get('shopName') as string || null
  const description = formData.get('description') as string || null

  await prisma.serviceRecord.create({
    data: {
      vehicleId,
      serviceType,
      mileageAtService,
      date,
      cost,
      shopName,
      description
    }
  })

  // Refresh this specific vehicle's page
  revalidatePath(`/vehicle/${vehicleId}`)
}

export async function deleteVehicle(formData: FormData) {
  const id = formData.get('id') as string
  await prisma.vehicle.delete({ where: { id } })
  revalidatePath('/')
}

export async function updateVehicle(formData: FormData) {
  const id = formData.get('id') as string
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const year = parseInt(formData.get('year') as string)
  const currentMileage = parseInt(formData.get('currentMileage') as string)

  await prisma.vehicle.update({
    where: { id },
    data: { make, model, year, currentMileage }
  })
  
  revalidatePath('/')
  redirect('/') // Sends you back to the garage after saving
}

export async function deleteServiceRecord(formData: FormData) {
  const id = formData.get('id') as string
  const vehicleId = formData.get('vehicleId') as string
  await prisma.serviceRecord.delete({ where: { id } })
  revalidatePath(`/vehicle/${vehicleId}`)
}

export async function updateServiceRecord(formData: FormData) {
  const id = formData.get('id') as string
  const vehicleId = formData.get('vehicleId') as string
  const serviceType = formData.get('serviceType') as string
  const mileageAtService = parseInt(formData.get('mileageAtService') as string)
  const date = new Date(formData.get('date') as string)
  const costInput = formData.get('cost')
  const cost = costInput ? parseFloat(costInput as string) : null
  const shopName = formData.get('shopName') as string || null
  const description = formData.get('description') as string || null

  await prisma.serviceRecord.update({
    where: { id },
    data: { serviceType, mileageAtService, date, cost, shopName, description }
  })
  
  revalidatePath(`/vehicle/${vehicleId}`)
  redirect(`/vehicle/${vehicleId}`) // Sends you back to the vehicle details
}