import axios from "axios";
const apiUrl = process.env.NODE_ENV === 'production' ? "": '';

const newRequest = axios.create({
  baseURL:"",
  withCredentials: true,
});

export default newRequest;



export async function callGetSignatureApi(nftAmount:number,address:string) {
  try {
    const response = await axios.post('/api/get/getSignatures', { nftAmount ,address}); // Assuming the route is at '/api/getSignature'
    return response.data;
  } catch (error) {
    console.error("Error calling getSignature API:", error);
    return null
  }
}

export async function callCheckerApi(address:string,chainId:number) {
  try {
    const response = await axios.post('/api/get/getChecker', { address,chainId}); 
    return response.data;
  } catch (error) {
    console.error("Error calling getSignature API:", error);
    return null
  }
}