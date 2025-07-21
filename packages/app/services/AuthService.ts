import type { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

export async function createVisitData<T, S>(visitId: string | undefined, data: S): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visits/${visitId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiEditVisitData<T, U>(visitId: string | undefined, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `cases/visits/${visitId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Text data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error editting Text data:', error)
    throw error
  }
}

export async function apiEditAnthropometryData<T, U>(anthropometryId: number, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `cases/anthropometry/${anthropometryId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Text data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error editting anthropometry data:', error)
    throw error
  }
}

export async function getVisitData<T>(visitId: string): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }
  const url = `cases/visits/${visitId}`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers,
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Visit data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error getting visit data:', error)
    throw error
  }
}

export async function getVisitbyCaseID<T>(caseId: string | number): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }
  const url = `cases/visits/case/${Number(caseId)}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers,
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiAddVisit<T, S>(data: S): Promise<T> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `cases/visit/new`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data: { ...data, case_id: Number(data.case_id) },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Visit created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating visit:', error)
    throw error
  }
}

export async function updateVisitStatus<T>(visitId: number, status: string): Promise<T> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `cases/visit-status/${visitId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers,
    data: { status },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Visit status updated:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating visit status:', error)
    throw error
  }
}
export async function createVitalData(
  visitId: string | undefined,
  data: TypeVitals
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/vitals` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function createSymptomsData(
  visitId: string | undefined,
  data: TypeSymptom
): Promise<void> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `cases/visit/${visitId}/symptoms` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function createDiagnosisData(
  visitId: string | undefined,
  data: TypeDiagnosis
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/diagnosis` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function createMedicationData<T, S>(visitId: number, data: S): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/medications` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function createExaminationData(
  visitId: string | undefined,
  data: TypeExamination
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/examinations` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function createReferralData(
  visitId: string | undefined,
  data: TypeReferral
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/referrals` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function createFollowupsData(
  visitId: string | undefined,
  data: TypeFollowup
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/followups` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function apiAddModule<T>(visitId: string | undefined, data: CreateModule): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/modules` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function createServicesData(
  visitId: string | undefined,
  data: TypeService
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/services` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiAddVitalData<T, U>(visitId: number, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/vitals` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function addSymptomsData(
  visitId: string | undefined,
  data: TypeSymptom
): Promise<void> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `cases/visit/${visitId}/symptoms` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function addDiagnosisData(
  visitId: string | undefined,
  data: TypeDiagnosis
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/diagnosis` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiAddMedicationData<T, U>(visitId: string | undefined, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/medications` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Medications data created:', response)
    return response.data
  } catch (error) {
    console.error('Error creating Medications data:', error)
    throw error
  }
}
export async function addExaminationData(
  visitId: string | undefined,
  data: TypeExamination
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/examinations` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function apiAddReferralData<T, U>(visitId: string | undefined, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/referrals` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Referral data created:', response)
    return response.data
  } catch (error) {
    console.error('Error creating Referral data:', error)
    throw error
  }
}

export async function apiAddFollowupsData<T, U>(visitId: string | undefined, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/followups` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Follow Up data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiAddServicesData<T, U>(visitId: string | undefined, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/services` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiDeleteVitalsData<T>(vitalsId: number): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/vitals/${vitalsId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'DELETE',
    headers,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function apiDeleteSymptomsData(
  visitId: string | undefined,
  data: TypeSymptom
): Promise<void> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `cases/visit/${visitId}/symptoms` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function apiDeleteDiagnosisData(
  visitId: string | undefined,
  data: TypeDiagnosis
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/diagnosis` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiDeleteExaminationData(
  visitId: string | undefined,
  data: TypeExamination
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/examinations` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiDeleteReferralData<T>(referralId: number): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/refferals/${referralId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'DELETE',
    headers,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Referral data Deleted:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting referrals data:', error)
    throw error
  }
}
export async function apiDeleteFollowupsData<T>(followupId: number): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/followups/${followupId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'DELETE',
    headers,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiDeleteServicesData<T>(seriveId: number): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/services/${seriveId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'DELETE',
    headers,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiDeleteMedicationData<T>(medicationsId: number): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/medications/${medicationsId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'DELETE',
    headers,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Medications data deleted:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting Medications data:', error)
    throw error
  }
}

export async function apiEditVitalsData<T, U>(vitalsId: number, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/vitals/${vitalsId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers,
    maxRedirects: 5,
    data,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function apiEditAdvice<T, U>(vitalsId: number, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/vitals/${vitalsId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers,
    maxRedirects: 5,
    data,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function apiEditSymptomsData(
  visitId: string | undefined,
  data: TypeSymptom
): Promise<void> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `cases/visit/${visitId}/symptoms` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}
export async function apiEditDiagnosisData(
  visitId: string | undefined,
  data: TypeDiagnosis
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/diagnosis` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiEditMedicationsData<T, U>(medicationId: number, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/medications/${medicationId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers,
    maxRedirects: 5,
    data,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Medication data Editted:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Editting Medication data:', error)
    throw error
  }
}
export async function apiEditExaminationData(
  visitId: string | undefined,
  data: TypeExamination
): Promise<void> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/examinations` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<any>(axiosConfig)
    console.log('Case data created:', response.data)
    //return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiEditReferralData<T, U>(referralId: number, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/refferals/${referralId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers,
    maxRedirects: 5,
    data,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Referral data Editted:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Editting Referral data:', error)
    throw error
  }
}
export async function apiEditFollowupsData<T, U>(followupID: number, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/followups/${followupID}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Follow Up data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiEditServicesData<T, U>(serviceId: number, data: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/services/${serviceId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers,
    maxRedirects: 5,
    data,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiAddVisitModule<T>(
  visitId: string | undefined,
  data: CreateModule
): Promise<T> {
  const headers = {
    apikey: API_KEY,
    // Add any other required headers here
  }

  const url = `cases/visit/${visitId}/modules` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers,
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiDeleteVisitModule<T>(id: string): Promise<T> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `modules/visit/${id}`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'DELETE',
    headers: headers,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)

    return response.data
  } catch (error) {
    console.error('Error fetching visit cases:', error)
    throw error
  }
}

export async function apiEditVisitModule<T, U extends Record<string, unknown>>({
  data,
  id,
}: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `modules/visit/${id}`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers: headers,
    maxRedirects: 5,
    data,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)

    return response.data
  } catch (error) {
    console.error('Error fetching modules:', error)
    throw error
  }
}

export async function apiGetInteractions<T, U>(medicineIds: U): Promise<T> {
  const headers = {
    apikey: API_KEY,
  }
  console.log(medicineIds)
  const url = `search/search-drugInteractions`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: headers,
    maxRedirects: 5,
    data: { medicineIds },
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)

    return response.data
  } catch (error) {
    console.error('Error fetching modules:', error)
    throw error
  }
}

export async function apiSearchVisitByCase<T>(searchText: string, caseID: number): Promise<T> {
  const headers = {
    apikey: API_KEY,
  }

  const url = `/cases/searchvisitbycase/${searchText}/${caseID}`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: headers,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)

    return response.data
  } catch (error) {
    console.error('Error Searching Visit by Cases Data', error)
    throw error
  }
}
