import { calculateCartClubbing } from './cartLogic'

// Test data
const createCartDay = (day: string, date: string, items: any[]) => ({
  day,
  date,
  items,
  dayTotal: items.reduce((sum, item) => sum + (item.food?.price || 0) * item.quantity, 0)
})

describe('Cart Clubbing Logic', () => {
  test('Scenario: Thursday ($7.29) + Friday ($5.00) = $12.29 > $10 minimum - should club to Friday', () => {
    const cartDays = [
      createCartDay('Thursday', '2024-01-04', [
        { food: { price: 7.29 }, quantity: 1 } // $7.29
      ]),
      createCartDay('Friday', '2024-01-05', [
        { food: { price: 5.00 }, quantity: 1 } // $5.00
      ])
    ]
    
    const result = calculateCartClubbing(cartDays, 10)
    
    expect(result.canCheckout).toBe(true)
    expect(result.deliveryMessages).toHaveLength(2)
    
    const thursdayMessage = result.deliveryMessages.find(msg => msg.day === 'Thursday')
    const fridayMessage = result.deliveryMessages.find(msg => msg.day === 'Friday')
    
    // Thursday should show red message with shortfall and clubbed delivery
    expect(thursdayMessage?.color).toBe('red')
    expect(thursdayMessage?.message).toBe("Add $2.71 to your order for delivery on 'Thursday'")
    expect(thursdayMessage?.isClubbed).toBe(true)
    expect(thursdayMessage?.deliveryDay).toBe('Friday')
    
    // Friday should show green message for same day delivery
    expect(fridayMessage?.color).toBe('green')
    expect(fridayMessage?.message).toBe("Min. order value met, your 'Friday' order will be delivered the same day.")
    expect(fridayMessage?.deliveryDay).toBe('Friday')
  })

  test('Scenario: Both days meet minimum individually', () => {
    const cartDays = [
      createCartDay('Thursday', '2024-01-04', [
        { food: { price: 12.00 }, quantity: 1 } // $12.00
      ]),
      createCartDay('Friday', '2024-01-05', [
        { food: { price: 15.00 }, quantity: 1 } // $15.00
      ])
    ]
    
    const result = calculateCartClubbing(cartDays, 10)
    
    expect(result.canCheckout).toBe(true)
    expect(result.deliveryMessages).toHaveLength(2)
    
    const thursdayMessage = result.deliveryMessages.find(msg => msg.day === 'Thursday')
    const fridayMessage = result.deliveryMessages.find(msg => msg.day === 'Friday')
    
    expect(thursdayMessage?.color).toBe('green')
    expect(thursdayMessage?.message).toContain('Min. order value met')
    expect(fridayMessage?.color).toBe('green')
    expect(fridayMessage?.message).toContain('Min. order value met')
  })

  test('Scenario: Combined total does not meet minimum - should not allow checkout', () => {
    const cartDays = [
      createCartDay('Thursday', '2024-01-04', [
        { food: { price: 3.00 }, quantity: 1 } // $3.00
      ]),
      createCartDay('Friday', '2024-01-05', [
        { food: { price: 2.00 }, quantity: 1 } // $2.00
      ])
    ]
    
    const result = calculateCartClubbing(cartDays, 10)
    
    expect(result.canCheckout).toBe(false)
    expect(result.totalShortfall).toBe(5.00) // $10 - $5 = $5
    expect(result.deliveryMessages).toHaveLength(2)
    
    const thursdayMessage = result.deliveryMessages.find(msg => msg.day === 'Thursday')
    const fridayMessage = result.deliveryMessages.find(msg => msg.day === 'Friday')
    
    expect(thursdayMessage?.color).toBe('red')
    expect(thursdayMessage?.shortfall).toBe(7.00)
    expect(fridayMessage?.color).toBe('red')
    expect(fridayMessage?.shortfall).toBe(8.00)
  })

  test('Scenario: One day meets minimum, other does not - should allow checkout', () => {
    const cartDays = [
      createCartDay('Thursday', '2024-01-04', [
        { food: { price: 14.00 }, quantity: 1 } // $14.00
      ]),
      createCartDay('Friday', '2024-01-05', [
        { food: { price: 5.00 }, quantity: 1 } // $5.00
      ])
    ]
    
    const result = calculateCartClubbing(cartDays, 10)
    
    expect(result.canCheckout).toBe(true)
    expect(result.deliveryMessages).toHaveLength(2)
    
    const thursdayMessage = result.deliveryMessages.find(msg => msg.day === 'Thursday')
    const fridayMessage = result.deliveryMessages.find(msg => msg.day === 'Friday')
    
    expect(thursdayMessage?.color).toBe('green')
    expect(thursdayMessage?.message).toContain('Min. order value met')
    expect(fridayMessage?.color).toBe('red')
    expect(fridayMessage?.message).toContain('Add $5.00 to your order for delivery on \'Friday\'')
  })
})
