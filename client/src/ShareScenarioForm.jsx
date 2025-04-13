// import { useData } from "./DataContext";
// import { useEffect, useState } from "react";
// import { useSelected } from "./SelectedContext";
// import styles from "./ShareScenarioForm.module.css";

// export default function ShareScenarioForm(){
//     const { accessList, fetchAccessList, shareScenario } = useData();
//     const { selectedScenario } = useSelected();
//     useEffect(() => {
//         fetchAccessList(selectedScenario.id);
//     }, []);

//     const [formData, setFormData] = useState({
//         user_id: "",
//         permission: "",
//     })

// 	const handleChange = (e) => {
// 		const { name, value, type, checked } = e.target;
// 		setFormData((prev) => ({
// 			...prev,
// 			[name]: type === "checkbox" ? checked : value,
// 		}));
// 	};

// 	const handleSubmit = async (e) => {
// 		e.preventDefault();

//         // reset form
//         setFormData({
//             user_id: "",
//             permission: "",    
//         })
//         fetchAccessList(selectedScenario.id);
//     }

//     return (
//         <div className={styles["form-container"]}>
//             <button className={styles["back-button"]} onClick={() => window.history.back()}>
//                 ⬅️ Go Back
//             </button>
//             <div className={styles["form-content"]}>
//                 <div className={`${styles["outer-container"]} ${styles["share-list-outer-container"]}`}>
//                     <div className={styles["inner-container"]}>
//                         <div className={styles["share-list-container"]}>
//                             <h2>Shared With:</h2>
//                             <div className={styles["share-list"]}>
//                             {accessList.length === 0 && <li>No users yet</li>}
//                             {accessList.map((entry) => (
//                                 <div className={styles["user-item"]} 
//                                 key={entry.user_id}>
//                                 {entry.email} — {entry.permission === "rw" ? "Read/Write" : "Read Only"}
//                                 <button className={styles["remove-button"]}>
//                                     ❌
//                                 </button>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className={styles["share-actions"]}>
//                 <h2 className={styles["actions-header"]}>Share:</h2>
//                 <h3 className={styles["outer-container"]}>
//                     <div className={styles["inner-container"]}>
//                         <div className={styles["selected-text"]}>
//                             <label>Selected Scenario:</label>
//                             <label>{selectedScenario.name}</label>    
//                         </div>
//                     </div>
//                 </h3>
//                 <form className={styles["share-form"]} onSubmit={handleSubmit}>
//                     <div className={styles["form-group"]}>
//                         <label htmlFor="user_id">Email:</label>
//                         <input
//                             type="email"
//                             id="user_id"
//                             name="user_id"
//                             value={formData.user_id}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div className={styles["form-group"]}>
//                         <label htmlFor="permission">Permission:</label>
//                         <select
//                             id="permission"
//                             name="permission"
//                             value={formData.permission}
//                             onChange={handleChange}
//                             required
//                         >
//                             <option value="" disabled>
//                                 Select Permission
//                             </option>
//                             <option value="r">Read Only</option>
//                             <option value="rw">Read/Write</option>
//                         </select>
//                     </div>
//                     <button
//                         type="submit"
//                         className={`${styles["action-button"]} ${styles["share"]}`}
//                         onClick={handleSubmit}
//                         >
//                         Share
//                     </button>
//                 </form>

//             </div>
//         </div>
//     </div>
//     );
// }

import { useData } from "./DataContext";
import { useEffect, useState } from "react";
import { useSelected } from "./SelectedContext";
import styles from "./ShareScenarioForm.module.css";

export default function ShareScenarioForm() {
  const { accessList, fetchAccessList, shareScenario, removeScenarioAccess } = useData();
  const { selectedScenario } = useSelected();

  useEffect(() => {
    fetchAccessList(selectedScenario.id);
  }, [selectedScenario.id]);

  const [formData, setFormData] = useState({
    email: "",
    permission: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {success, message} = await shareScenario(
      selectedScenario.id,
      formData.email,
      formData.permission
    );

    if (success) {
      setFormData({ email: "", permission: "" });
      fetchAccessList(selectedScenario.id);
    }
    else if (!success){
        alert(message);
    }
  };

  const handleRemoveButton = async (userIdToRemove) => {
    const confirmed = window.confirm("Are you sure you want to remove this user's access?");
    if (!confirmed) return;

    const success = await removeScenarioAccess(selectedScenario.id, userIdToRemove);
    if (success) {
        
    } else {
      alert("Failed to remove access.");
    }
  };

  return (
    <div className={styles["form-container"]}>
      <button className={styles["back-button"]} onClick={() => window.history.back()}>
        ⬅️ Go Back
      </button>
      <div className={styles["form-content"]}>
        <div className={`${styles["outer-container"]} ${styles["share-list-outer-container"]}`}>
          <div className={styles["inner-container"]}>
            <div className={styles["share-list-container"]}>
              <h2>Shared With:</h2>
              <div className={styles["share-list"]}>
                {accessList.length === 0 && <div className={styles["user-item"]}>Nobody!</div>}
                {accessList.map((entry) => (
                  <div className={styles["user-item"]} key={entry.user_id}>
                    {entry.email} — {entry.permission === "rw" ? "Read/Write" : "Read Only"}
                    <button className={styles["remove-button"]} onClick={() => handleRemoveButton(entry.user_id)}>
                        ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles["share-actions"]}>
          <h2 className={styles["actions-header"]}>Share:</h2>
          <h3 className={styles["outer-container"]}>
            <div className={styles["inner-container"]}>
              <div className={styles["selected-text"]}>
                <label>Selected Scenario:</label>
                <label>{selectedScenario.name}</label>
              </div>
            </div>
          </h3>

          <form className={styles["share-form"]} onSubmit={handleSubmit}>
            <div className={styles["form-group"]}>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="permission">Permission:</label>
              <select
                id="permission"
                name="permission"
                value={formData.permission}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Permission
                </option>
                <option value="r">Read Only</option>
                <option value="rw">Read/Write</option>
              </select>
            </div>

            <button
              type="submit"
              className={`${styles["action-button"]} ${styles["share"]}`}
            >
              Share
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
