import { useEffect, useState } from "react";

import InputField from "../../../../components/common/InputField";
import OtpField from "./OtpField";
import SmallButton from "../../components/SmallButton";
import BigButton from "../../components/BigButton";

import config from "../../../../config";
import Timer from "./Timer";
import Alert from "../../../../components/common/Alert";


function FormStepOne({formData, onInputChange, onContinueClick, setIsLoading, onAlert}){
    const [otp, setOtp] = useState(new Array(4).fill(''));

    const [isAlert, setIsAlert] = useState({});

    const [isOtpSent, setIsOtpSent] = useState(false);

    const [isTimerVisible, setIsTimerVisible] = useState(false);

    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isOtpValid, setIsOtpValid] = useState(false);


    useEffect(()=>{
      const emailValidInfo = checkEmail();

      
      if(!emailValidInfo.ok){
        onAlert("email", emailValidInfo.message);
        setIsEmailValid(false);
      }
      else{
        onAlert("email", null);
        setIsEmailValid(true);
      }
    }, [formData.email])


    function checkOtp(){
      if(otp.join('')==''){
        return {
          ok: false,
          message: 'OTP cannot be empty'
        }
      }

      return {
        ok: true,
        message: null
      };
    }

    useEffect(()=>{
      const otpValidInfo = checkOtp();

      if(!otpValidInfo.ok){
        setIsOtpValid(false);
      }
      else{
        setIsOtpValid(true);
      }
      // to do - add alert
    }, [otp])

    async function handleContinueClick(){
      if(isOtpSent){

        if(!isOtpValid){
          // to do - add alert
          return;
        }

        setIsLoading(true);

        try {
          const response = await fetch(config.serverURL+"/otp/verifyotp", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: formData.email, otp: otp.join('')})
          })

          const data = await response.json();
          if(!response.ok){
            setIsAlert({
              isSuccess: false,
              text: data.message
            })
            return;
          }

          onContinueClick();
        } catch(e) {
          setIsAlert({ isSuccess: false, text: 'Something went wrong. Please try again.' });
        } finally {
          setIsLoading(false);
        }
      }

    }

    function checkEmail(){
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if(formData.email==''){
        return {
          ok: false,
          message: 'Email cannot be empty'
        }
      }
      else if(!emailRegex.test(formData.email)){
        return {
          ok: false,
          message: 'Invalid email'
        }
      }

      return {
        ok: true,
        message: null
      };
    }

    async function handleSendOtp(){
      setIsLoading(true);

      try {
        if(isEmailValid){
          const response = await fetch(config.serverURL+'/otp/sendotp', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({email: formData.email})
          })
          const data = await response.json();

          if(!response.ok){
            setIsAlert({ isSuccess: false, text: data.message });
            return;
          }

          setIsTimerVisible(true);
          setIsOtpSent(true);
        }
      } catch(e) {
        setIsAlert({ isSuccess: false, text: 'Something went wrong. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }

    return (
        <div className='flex flex-col'>
          <InputField label="Email Address" type="email" placeholder={"john@doe.com"}  name={"email"} value={formData.email} onChange={(e)=>onInputChange(e.target.name, e.target.value)} alert={formData.alert.email} />
          
          {
            (isOtpSent)?
              (
                <div className="mt-4 flex flex-col">
                  <div className="text-xs pb-2">Enter OTP</div>
                  <OtpField otp={otp} setOtp={setOtp} />

                  <div className="mt-2">
                    {(isTimerVisible) ? 
                      (
                        <div className="text-xs flex">
                          <p>Resend OTP in&nbsp;</p>
                          <Timer seconds={60} isTimerVisible={isTimerVisible} setIsTimerVisible={setIsTimerVisible} />
                        </div>
                      )
                      :
                      (
                        <div className="mt-1">
                          <SmallButton text={'Resend OTP'} onButtonClick={handleSendOtp}  />
                        </div>
                      )
                    }

                  </div>
                </div>
              ):
              (
                <div className="mt-2 mr-auto">
                  <SmallButton text={'Send OTP'} onButtonClick={handleSendOtp}  />
                </div>
              )
          }
          

          <div className="mt-4">
              <BigButton text={"Continue"} onButtonClick={handleContinueClick} />
          </div>


          {
            isAlert.text && <div className='fixed top-2 right-2'>
              <Alert text={isAlert.text} isSuccess={isAlert.isSuccess} setIsAlert={setIsAlert} />
            </div>
          }


        </div>
    )
}

export default FormStepOne;