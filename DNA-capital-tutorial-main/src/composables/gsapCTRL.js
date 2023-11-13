import gsap from "gsap";
import {MotionPathPlugin} from "gsap/MotionPathPlugin"

var rigistGSAPPlugin = function rigistGSAPPlugin(){
    //list as many as you'd like
    gsap.registerPlugin(MotionPathPlugin);
}
export { rigistGSAPPlugin }