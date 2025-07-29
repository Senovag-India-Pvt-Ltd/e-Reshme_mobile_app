import React, { useEffect } from 'react';
import { IonBackButton, IonButton, IonCol, IonContent, IonGrid, IonItemDivider, IonLabel, IonModal, IonRow } from '@ionic/react';

interface PopupFormProps {
    isOpen: boolean;
    onClose: () => void;
    itemData: any;
}

const PopupForm: React.FC<PopupFormProps> = ({ isOpen, onClose, itemData }) => {
    
    const formatTime = (timeString: string): string => {
        if (!timeString) return ""; // Return empty string if timeString is undefined
        const [timer, miliseconds] = timeString.split(".");
        return `${timer}`;
    };
    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonContent>
            {/* <IonBackButton defaultHref="/" /> */}
                {/* <IonGrid className="custom-center"> */}
                <div className="modal-wrapper">
                    <div className="modal-content" style={{ display: 'flex', flexDirection: 'column' }}>

                        <IonRow>
                            <IonCol size="6">
                                <IonLabel>Lot Number</IonLabel>
                            </IonCol>
                            <IonCol size="6">
                                <IonLabel>{itemData.lotId}</IonLabel>
                            </IonCol>
                        </IonRow>
                        <IonItemDivider className='divider-component' />
                        <IonRow>
                            <IonCol size="6">
                                <IonLabel>Reeler Number</IonLabel>
                            </IonCol>
                            <IonCol size="6">
                                <IonLabel>{itemData.reelerLicenseNumber}</IonLabel>
                            </IonCol>
                        </IonRow>
                        <IonItemDivider className='divider-component' />
                        <IonRow>
                            <IonCol size="6">
                                <IonLabel>Bid Amount</IonLabel>
                            </IonCol>
                            <IonCol size="6">
                                <IonLabel>{itemData.bidAmount}</IonLabel>
                            </IonCol>
                        </IonRow>
                        <IonItemDivider className='divider-component' />
                        <IonRow>
                            <IonCol size="6">
                                <IonLabel>eTime Bid</IonLabel>
                            </IonCol>
                            <IonCol size="6">
                                <IonLabel>{formatTime(itemData.bidTime)}</IonLabel>
                            </IonCol>
                        </IonRow>
                        <IonItemDivider className='divider-component' />
                        <IonRow>
                            <IonCol size="6">
                                <IonLabel>Status</IonLabel>
                            </IonCol>
                            <IonCol size="6">
                                <IonLabel>{itemData.accepted}</IonLabel>
                            </IonCol>
                        </IonRow>
                        <IonItemDivider className='divider-component' />
                        <IonRow>
                            <IonCol size="6">
                                <IonLabel>Auction Number</IonLabel>
                            </IonCol>
                            <IonCol size="6">
                                <IonLabel>{itemData.auctionNumber}</IonLabel>
                            </IonCol>
                        </IonRow>
                        <IonItemDivider className='divider-component' />
                        <IonRow>
                            <IonCol size="6">
                                <IonLabel>Accepted by</IonLabel>
                            </IonCol>
                            <IonCol size="6">
                                <IonLabel>{itemData.acceptedBy}</IonLabel>
                            </IonCol>
                        </IonRow>
                        <IonItemDivider className='divider-component' />
                        <IonRow>
                            <IonCol size="6">
                                <IonLabel>Accepted time</IonLabel>
                            </IonCol>
                            <IonCol size="6">
                                <IonLabel>{formatTime(itemData.acceptedTime)}</IonLabel>
                            </IonCol>
                        </IonRow>
                        <IonItemDivider className='divider-component' />
                        <IonButton onClick={onClose}>Close</IonButton>
                        {/* </IonGrid> */}
                    </div>
                </div>
            </IonContent>

        </IonModal>
    );
};

export default PopupForm;
