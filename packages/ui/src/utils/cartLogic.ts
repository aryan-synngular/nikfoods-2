export interface CartDay {
  day: string
  date: string
  items: any[]
  dayTotal: number
  deliveryDate?: string
  deliveryDay?: string
}

export interface CartClubbingResult {
  canCheckout: boolean
  clubbedDays: CartDay[]
  deliveryMessages: DeliveryMessage[]
  totalShortfall: number
}

export interface DeliveryMessage {
  day: string
  message: string
  color: 'red' | 'green' | 'orange'
  shortfall?: number
  deliveryDay?: string
  isClubbed?: boolean
}

export function calculateCartClubbing(
  cartDays: CartDay[],
  minCartValue: number
): CartClubbingResult {
  const result: CartClubbingResult = {
    canCheckout: false,
    clubbedDays: [],
    deliveryMessages: [],
    totalShortfall: 0
  }

  if (!cartDays.length) {
    return result
  }

  // Sort days by date
  const sortedDays = [...cartDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Calculate individual day totals
  const dayAnalysis = sortedDays.map((day, index) => {
    const dayTotal = day.items.reduce((sum, item) => sum + (item.food?.price || 0) * item.quantity, 0)
    const shortfall = Math.max(0, minCartValue - dayTotal)
    const meetsMinimum = dayTotal >= minCartValue
    
    return {
      ...day,
      dayTotal,
      shortfall,
      meetsMinimum,
      originalIndex: index
    }
  })

  // Check if any individual day meets minimum
  const daysMeetingMinimum = dayAnalysis.filter(day => day.meetsMinimum)
  
  if (daysMeetingMinimum.length > 0) {
    // At least one day meets minimum - can checkout
    result.canCheckout = true
    
    // Check for specific case: Friday meets minimum, Saturday doesn't meet minimum
    // In this case, club both to Saturday
    const hasFridaySaturdayScenario = dayAnalysis.length >= 2 && 
      dayAnalysis[0].day === 'Friday' && dayAnalysis[1].day === 'Saturday' &&
      dayAnalysis[0].meetsMinimum && !dayAnalysis[1].meetsMinimum
    
    if (hasFridaySaturdayScenario) {
      // Special case: Club both Friday and Saturday to Saturday
      dayAnalysis.forEach((day) => {
        result.clubbedDays.push({
          ...day,
          deliveryDate: dayAnalysis[1].date, // Saturday's date
          deliveryDay: dayAnalysis[1].day    // Saturday
        })
        
        if (day.meetsMinimum && day.day === 'Friday') {
          // Friday meets minimum but is being clubbed to Saturday
          result.deliveryMessages.push({
            day: day.day,
            message: `Min. order value met, your '${day.day}' order will be delivered on '${dayAnalysis[1].day}'`,
            color: 'orange',
            deliveryDay: dayAnalysis[1].day,
            isClubbed: true
          })
        } else if (day.day === 'Saturday') {
          // Saturday - delivery is on Saturday (same day)
          result.deliveryMessages.push({
            day: day.day,
            message: `Min. order value met, your '${day.day}' order will be delivered the same day.`,
            color: 'green',
            deliveryDay: dayAnalysis[1].day
          })
        }
      })
    } else {
      // Process each day individually (original logic)
      dayAnalysis.forEach((day) => {
        if (day.meetsMinimum) {
          // Day meets minimum - same day delivery
          result.clubbedDays.push({
            ...day,
            deliveryDate: day.date,
            deliveryDay: day.day
          })
          
          result.deliveryMessages.push({
            day: day.day,
            message: `Min. order value met, your '${day.day}' order will be delivered the same day.`,
            color: 'green',
            deliveryDay: day.day
          })
        } else {
          // Day doesn't meet minimum - check if it can be clubbed
          const canBeClubbed = checkIfCanBeClubbed(day, dayAnalysis, minCartValue)
          
          if (canBeClubbed) {
            // Can be clubbed - find the latest delivery day among clubbed days
            const latestDeliveryDay = findLatestDeliveryDay(day, dayAnalysis, minCartValue)
            
            result.clubbedDays.push({
              ...day,
              deliveryDate: latestDeliveryDay.date,
              deliveryDay: latestDeliveryDay.day
            })
            
            result.deliveryMessages.push({
              day: day.day,
              message: `Add $${day.shortfall.toFixed(2)} to your order for delivery on '${latestDeliveryDay.day}'`,
              color: 'red',
              shortfall: day.shortfall,
              deliveryDay: latestDeliveryDay.day,
              isClubbed: true
            })
          } else {
            // Cannot be clubbed - show shortfall for original day
            result.clubbedDays.push({
              ...day,
              deliveryDate: day.date,
              deliveryDay: day.day
            })
            
            result.deliveryMessages.push({
              day: day.day,
              message: `Add $${day.shortfall.toFixed(2)} to your order for delivery on '${day.day}'`,
              color: 'red',
              shortfall: day.shortfall,
              deliveryDay: day.day
            })
          }
        }
      })
    }
  } else {
    // No individual day meets minimum - check if clubbing works
    const totalCartValue = dayAnalysis.reduce((sum, day) => sum + day.dayTotal, 0)
    
    if (totalCartValue >= minCartValue) {
      // Can checkout with clubbing - all items go to the latest day
      result.canCheckout = true
      const latestDay = dayAnalysis[dayAnalysis.length - 1]
      
      dayAnalysis.forEach((day) => {
        result.clubbedDays.push({
          ...day,
          deliveryDate: latestDay.date,
          deliveryDay: latestDay.day
        })
        
        if (day.day === latestDay.day) {
          result.deliveryMessages.push({
            day: day.day,
            message: `Min. order value met, your '${day.day}' order will be delivered the same day.`,
            color: 'green',
            deliveryDay: day.day
          })
        } else {
          result.deliveryMessages.push({
            day: day.day,
            message: `Add $${day.shortfall.toFixed(2)} to your order for delivery on '${day.day}'`,
            color: 'red',
            shortfall: day.shortfall,
            deliveryDay: latestDay.day,
            isClubbed: true
          })
        }
      })
    } else {
      // Cannot checkout - total shortfall
      result.canCheckout = false
      result.totalShortfall = minCartValue - totalCartValue
      
      dayAnalysis.forEach((day) => {
        result.clubbedDays.push({
          ...day,
          deliveryDate: day.date,
          deliveryDay: day.day
        })
        
        result.deliveryMessages.push({
          day: day.day,
          message: `Add $${day.shortfall.toFixed(2)} to your order for delivery on '${day.day}'`,
          color: 'red',
          shortfall: day.shortfall,
          deliveryDay: day.day
        })
      })
    }
  }

  return result
}

function checkIfCanBeClubbed(day: any, allDays: any[], minCartValue: number): boolean {
  // Check if combining with future days can meet minimum
  const futureDays = allDays.slice(day.originalIndex + 1)
  const combinedTotal = day.dayTotal + futureDays.reduce((sum, futureDay) => sum + futureDay.dayTotal, 0)
  
  return combinedTotal >= minCartValue
}

function findLatestDeliveryDay(day: any, allDays: any[], minCartValue: number): any {
  // Find the latest day that can be used for delivery
  const futureDays = allDays.slice(day.originalIndex + 1)
  
  // If any future day meets minimum individually, use the latest one
  const daysMeetingMinimum = futureDays.filter(d => d.meetsMinimum)
  if (daysMeetingMinimum.length > 0) {
    return daysMeetingMinimum[daysMeetingMinimum.length - 1]
  }
  
  // Otherwise, use the latest day in the sequence
  return allDays[allDays.length - 1]
}

export function getCheckoutMessage(cartDays: CartDay[], minCartValue: number): string {
  const clubbingResult = calculateCartClubbing(cartDays, minCartValue)
  
  if (!clubbingResult.canCheckout) {
    return `The minimum order price hasn't been reached yet. Add another $${clubbingResult.totalShortfall.toFixed(2)} to complete the order.`
  }
  
  return ''
}
