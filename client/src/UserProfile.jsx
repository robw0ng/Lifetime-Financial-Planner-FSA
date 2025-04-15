import { useAuth } from './AuthContext';
import styles from './UserProfile.module.css';
import defaultAvatar from './assets/nopfp.webp';
import { useData } from './DataContext';
import { useState, useEffect } from 'react';

export default function UserProfile(){
    const {user} = useAuth();
    const { fetchUserTaxYAML, uploadUserYaml, removeUserYaml } = useData();
    const [yamlText, setYamlText] = useState('');
    
    const handleUpload = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.yaml,.yml';
      
        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            const success = await uploadUserYaml(file);
            if (success) {
              const text = await file.text();
              setYamlText(text);
            }
          }
        };
      
        fileInput.click();
    };
              
    const handleRemove = async () => {
      const success = await removeUserYaml();
      if (success) {
        setYamlText('');
      }
    };

    useEffect(() => {
        const fetchYaml = async () => {
          if (user?.email) {
            const content = await fetchUserTaxYAML();
            setYamlText(content || '');
          }
        };
        fetchYaml();
      }, [user]);

    return (
        <div className={styles['user-profile']}>
            <div className={styles['column']}>
                <div className={styles['outer-container']}>
                    <div className={styles['inner-container']}>
                        <div className={styles['profile-container']}>
                            <img
                            src={
                                user.name === 'Guest'
                                ? defaultAvatar
                                : user.picture
                            }
                            alt={user.name}
                            className={styles['avatar']}
                            referrerPolicy="no-referrer"
                            />
                            <div className={styles['user-info']}>
                                <span className={styles['username']}>
                                    {user.name === 'Guest' ? 'Guest' : user.name}
                                </span>

                                <span className={styles['email']}>
                                    Email Address: &nbsp;
                                    {user.email ? user.email : 'NA'}
                                </span>
                            </div>
                        </div>
                        <div className={styles['yaml-container']}>
                            <h3>Tax YAML</h3>
                            <textarea
                                className={styles['yaml-textarea']}
                                value={yamlText}
                                readOnly
                                rows={15}
                            />
                            <div className={styles['yaml-buttons']}>
                                <button className={styles['upload-button']} onClick={handleUpload}>Upload YAML</button>
                                <button className={styles['remove-button']} onClick={handleRemove}>Remove YAML</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}