export interface PlanModel {
    _id: string;
    name: string;
    ussd_name: string;
    price: number;
    waste_price: number;
    currency: string;
    discount: number;
    unit_price_adult: number;
    unit_price_child: number;
    family_price: number;
    image: string;
    pricing: string;
    is_active: boolean;
}
export interface CustomUserModel {
    address_city: string;
    address_street: string;
    address_state: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    _id: string;
    soso_id: string;
    image: string | null;
}
export interface MessageModel {
    _id: string;
    type: string;
    sender: string;
    recipient: string;
    message: string;
    subject: string;
    ticket: string;
    title: string;
    time: number;
    read: boolean;
    mimeType: string;
    link: string;
    createdAt: string;
}
export interface InsuranceModel {
    _id: string;
    user: string;
    soso_id: string;
    plan: string;
    plan_id: string;
    payment_ref: string;
    payment_method: string;
    insurance_provider: string;
    insurance_provider_id: string;
    registration_date: string;
    activation_date: number;
    expiry_date: number;
    status: string;
    wallet: string;
    agent: string;
    registrar: string;
    pharmacy: {
        name: string;
        state: string;
        lga: string;
        area: string;
        address: string;
    },
    hospital: {
        name: string;
        address: string;
        state: string;
        localGovt: string;
        email: string;
        phoneNo: string;
    };
}
export interface InsuranceState {
    insurance: InsuranceModel;
    errors: Array<string>;
    plans: Array<PlanModel>;
}

export interface WalletModel {
    _id: string;
    status: string;
    balance: number;
    paystack_id: string;
    virtual_account_id: string;
    virtual_account_bank: string;
    virtual_account_number: string;
    virtual_account_name: string;
    withdrawal_bank: string;
    withdrawal_account_number: string;
    withdrawal_account_name: string;
    withdrawal_account_bank_id: string;
    total_weight: number | 0;
    total_unit: number | 0;
    loan: number | 0;
    insurancePayments: number | 0;
}
export interface SosocareBankModel {
    account_bank: string;
    account_number: string;
    account_name: string;
    support_phone: string;
}
export interface WasteLogModel {
    _id: string;
    wallet: string | null;
    name: string;
    recyclable: string | null;
    available_weight: number | 0;
    converted_weight: number | 0;
    agent_accepted_weight: number | 0;
    agent_available_weight: number | 0;
    agent_converted_weight: number | 0;
    agent_cleared_weight: number | 0;
}
export interface RecyclableModel {
    _id: string;
    wallet: string | null;
    name: string;
    recyclable: string | null;
    available_weight: number | 0;
    converted_weight: number | 0;
    agent_accepted_weight: number | 0;
    agent_available_weight: number | 0;
    agent_converted_weight: number | 0;
    agent_cleared_weight: number | 0;
}
export interface TransactionModel {
    _id: string;
    reference: string;
    date: number;
    description: string;
    amount: number;
    currency: string;
    category: string;
    status: string;
    from: string;
    to: string;
    by: string;
    withdrawal_account_number: string;
    withdrawal_account_name: string;
    withdrawal_account_bank: string;
}

export interface WalletState {
    wallet: WalletModel;
    sosocareBank: SosocareBankModel;
    wastelogs: Array<WasteLogModel>;
    errors: Array<string>;
}

export interface UserModel {
    _id: string;
    soso_id: string;
    firstName: string;
    lastName: string;
    phone: string;
    phoneVerified: boolean;
    image: string | null;
    idType: string | null;
    idNumber: string | null;
    email: string | null;
    userType: string;
    authToken: string | null;
    expiresIn: number;
}

export interface UserState {
    user: UserModel;
    location: LocationModel;
    errors: Array<string>;
}
export interface AgentModel {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    phoneVerified: boolean;
    image: string | null;
    idType: string | null;
    idNumber: string | null;
    email: string | null;
    userType: string;
    authToken: string | null;
    expiresIn: number;
}

export interface LocationModel {
    address_country: string | null;
    address_state: string | null;
    address_street: string | null;
    address_city: string | null;
    address_zipcode: string | null;
    address_long: string | null;
    address_lat: string | null;
}
export interface AgentState {
    agent: AgentModel;
    location: LocationModel;
    errors: Array<string>;
}