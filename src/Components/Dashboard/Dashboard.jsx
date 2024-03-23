import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const authUser = getAuth().currentUser;

  if (!authUser) {
    return (
      <div className="margin-auto">
        <img
          src={
            "https://user-images.githubusercontent.com/47600906/92342363-50f71f00-f0de-11ea-85cf-d0af41acc6c8.png"
          }
          alt="Not authorized"
        />
      </div>
    );
  }
  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login"); // Redirect to the sign-in page after signing out
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      {/* Styled sign-out button */}
      <button
        onClick={userSignOut}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-4 ml-4"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;
