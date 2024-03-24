import { getAuth } from "firebase/auth";
import Aside from "./Aside";

const Dashboard = () => {
  const authUser = getAuth().currentUser;

  if (!authUser) {
    return (
      <div className="margin-auto justify-center">
        <img
          src={
            "https://user-images.githubusercontent.com/47600906/92342363-50f71f00-f0de-11ea-85cf-d0af41acc6c8.png"
          }
          alt="Not authorized"
        />
      </div>
    );
  }


  return (
    <div>
      <Aside />
    </div>
  );
};

export default Dashboard;
