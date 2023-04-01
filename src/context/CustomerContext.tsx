import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { createContext , useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiBackend from "../services/api";

import { AxiosError } from "axios";
import { iRegisterFormData } from "../pages/Register/Register";
import { iLoginFormData } from "../pages/Login/Login";

export interface iCustomerProviderProps{
  children: React.ReactNode
}

export interface iCustomerResponse{
  id: string,
  customer_name: string,
  CNPJ: number,
  email: string,
  isActive: boolean,
  contacts: iContactResponse[]
}

export interface iContactResponse{
  id: string,
  name: string,
  phone: string,
  email: string,
  isActive: boolean,
  createdAt: Date
}

export interface iCustomerContext{
  registerCustomer: (data: iRegisterFormData) => void,
  loginCustomer: (data: iLoginFormData) => void,
  customer: iCustomerResponse|null,
  setCustomer: React.Dispatch<React.SetStateAction<iCustomerResponse|null>>,
  contacts: iContactResponse[],
  setContacts: React.Dispatch<React.SetStateAction<iContactResponse[]>>,
  globalLoading: boolean,
  setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>,
}

export const CustomerContext = createContext<iCustomerContext>({} as iCustomerContext);

const CustomerProvider = ({children}:iCustomerProviderProps) => {
    const [customer, setCustomer] = useState<iCustomerResponse|null>(null)
    const [contacts, setContacts] = useState<iContactResponse[]>([])
    const [globalLoading, setGlobalLoading] = useState<boolean>(false)
    const navigate = useNavigate()
    const location = useLocation()

    async function registerCustomer(data:iRegisterFormData){
      
        setGlobalLoading(true)
        try {
          await apiBackend.post("/customers", data)
          navigate("/login")
          toast.success('🦄 Registration successfully completed!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });  
            
        } 
        catch (error) {
          console.log("222", error)
            toast.error('Your registration failed!', {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });         
        } 
        finally {
          setGlobalLoading(false)
        }
    }

    useEffect(() => {
        async function loadCustomer(){
          const token = localStorage.getItem('@INFINITY-TOKEN');
          const userId = localStorage.getItem('@INFINITY-CUSTOMER');

          if (token){
            // setGlobalLoading(true);
            try{
              apiBackend.defaults.headers.authorization = `Bearer ${token}`
              const { data } = await apiBackend.get(`/customers/${userId}`)
              setCustomer(data)
              setContacts(data.contacts)

              const toNavigate = location.state?.from?.pathname || "/dashboard"
              navigate(toNavigate, {replace:true})
            } 
            catch (error) {
                localStorage.removeItem('@INFINITY-TOKEN')
                localStorage.removeItem('@INFINITY-CUSTOMER')
                const requestError = error as AxiosError<any>
                toast.error(requestError.response?.data.message, {
                  position: "top-right",
                  autoClose: 3500,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "dark",
                })
            }
            finally {
              setGlobalLoading(false)
            }
          }
      }
      loadCustomer()
    }, [globalLoading])
    
    
    async function loginCustomer(data: iLoginFormData){
        setGlobalLoading(true);
        try {
          const response = await apiBackend.post("/login", data);
          const { userId, token } = response.data;
          console.log("uI", userId, "t", token)

          apiBackend.defaults.headers.authorization = `Bearer ${token}`;


          // setCustomer(customerResponse);
          // setContacts(customerResponse.contacts);

          localStorage.setItem("@INFINITY-TOKEN", token);
          localStorage.setItem("@INFINITY-CUSTOMER", userId);

          const toNavigate = location.state?.from?.pathname || "/dashboard";
          navigate(toNavigate, { replace: true });
          toast.success("Login realizado com sucesso!", {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          })     
        } 
        catch (error) {
            toast.error("Ops! Algo deu errado, tente novamente", {
              position: "top-right",
              autoClose: 2500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
        } 
        finally {
            setGlobalLoading(false)
        }
    }

    return (
        <CustomerContext.Provider 
          value={{
            registerCustomer, loginCustomer, 
            customer, setCustomer, 
            contacts, setContacts,
            globalLoading, setGlobalLoading
          }}>
            {children}
        </CustomerContext.Provider>
    )
}
export default CustomerProvider