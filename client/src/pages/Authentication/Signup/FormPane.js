import googleLogo from '../../../images/google_logo.png';
import InputField from '../../../components/common/InputField';
import BigButton from '../components/BigButton';
import ThirdPartyLoginButton from '../components/ThirdPartyLoginButton';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DarkModeToggleButton from '../components/DarkModeToggleButton';
import FormPaneContainer from '../components/FormPaneContainer';
import FormHeading from '../components/FormHeading';
import ButtonLabel from '../components/ButtonLabel';
import LinkLabel from '../components/LinkLabel';
import FormStepOne from './FormStepOne/FormStepOne';
import MultiStepForm from './MultiStepForm';
import FormStepTwo from './FormStepTwo/FormStepTwo';
import FormStepThree from './FormStepThree/FormStepThree';
import FormProgressBar from './components/FormProgressBar';
import config from '../../../config';
import FormStepFour from './FormStepFour/FormStepFour';
import Alert from '../../../components/common/Alert';

function FormPane({isMobileScreen, isDarkMode, setIsDarkMode, setIsLoading}){
    
    const navigate = useNavigate();

    const [isAlert, setIsAlert] = useState({});

    const [formData, setFormData] = useState({
      name: '',
      email: '',
      username: '',
      password: '',

      alert: {
        name: null,
        email: null,
        username: null,
        password: null
      }
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [isLastStep, setIsLastStep] = useState(false);

    async function handleSignUpClick(){
      
      if(!formData.name || !formData.email || !formData.username || !formData.password){
        setIsAlert({ isSuccess: false, text: 'All fields are required' });
        return;
      }

      try{
        setIsLoading(true);
        const response = await fetch(config.serverURL+"/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            username: formData.username,
            password: formData.password
          }),
        });
        const data = await response.json();

        if(!response.ok){
          setIsAlert({
            isSuccess: false,
            text: data.message
          })

          handleAlert('password', data.message);
          return;
        }

        navigate('/login');
        
      }
      catch (e){
        console.log(e);
      }
      finally{
        setIsLoading(false);
      }
      

    }


    function handleLoginClick(){
        setIsLoading(true);

        navigate('/login');

        setIsLoading(false);
    

    }

    function handleInputChange(key, value){
      setFormData((prevFormData)=>{
        return {
          ...prevFormData,
          [key]: value
        }
      })
    }


    function handleAlert(key, value){
      setFormData((prevFormData)=>{
        return {
          ...prevFormData,
          alert: {
            [key]: value
          }
        }
      })
    }


    function handleContinueClick(){
      setCurrentStep(currentStep+1);
    }


    return (
      <FormPaneContainer isMobileScreen={isMobileScreen} >
        <div className='flex mb-3'>
          <FormHeading heading={"Signup"} />

          <DarkModeToggleButton isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        </div>

        
  
        <MultiStepForm currentStep={currentStep} setCurrentStep={setCurrentStep} setIsLastStep={setIsLastStep} isLastStep={isLastStep}>
          <FormStepOne formData={formData} onInputChange={handleInputChange} onContinueClick={handleContinueClick} setIsLoading={setIsLoading} onAlert={handleAlert} />
          <FormStepTwo formData={formData} onInputChange={handleInputChange} onContinueClick={handleContinueClick} setIsLoading={setIsLoading} onAlert={handleAlert} />
          <FormStepThree formData={formData} onInputChange={handleInputChange} onContinueClick={handleContinueClick} setIsLoading={setIsLoading} onAlert={handleAlert} />
          <FormStepFour formData={formData} onInputChange={handleInputChange} onContinueClick={handleContinueClick} setIsLoading={setIsLoading} onAlert={handleAlert} onSignUpClick={handleSignUpClick} />
        </MultiStepForm>


        <div className='text-center flex flex-col'>
          
    
          <div className='mt-2'>
              <ButtonLabel text={"already have an account"} />
              <LinkLabel text={"Login"} onLinkClick={handleLoginClick} />
          </div>
        </div>


        {
          isAlert.text && <div className='fixed top-2 right-2'>
            <Alert text={isAlert.text} isSuccess={isAlert.isSuccess} setIsAlert={setIsAlert} />
          </div>
        }



      </FormPaneContainer>  
    )
}

export default FormPane;