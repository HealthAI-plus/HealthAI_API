
require('dotenv').config()

module.exports = {
    CHAT_API_KEY: process.env.CHAT_API_KEY,
    DB_URL: process.env.DB_URL,
    PORT: process.env.PORT,
    USER_JWT_SECRET: process.env.USER_JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    COOKIE_PARSER_SECRET: process.env.COOKIE_PARSER_SECRET,
    API_DOMAIN_NAME: process.env.API_DOMAIN_NAME,
    
    LOCAL_REACT_DEV_URL: process.env.LOCAL_REACT_DEV_URL, 
    PRODUCTION_REACT_DEV_URL: process.env.PRODUCTION_REACT_DEV_URL,
    PAYSTACK_KEY: process.env.PAYSTACK_KEY_LIVE,
    PAYSTACK_MONTHLY_PLAN_CODE: process.env.PAYSTACK_MONTHLY_PLAN_CODE,
    PAYSTACK_YEARLY_PLAN_CODE: process.env.PAYSTACK_YEARLY_PLAN_CODE,
    STRIPE_KEY: process.env.STRIPE_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,

    CONSTANTS: {
        PROMPT: {
            TYPES: {SPEECH: 'speech', TEXT: 'text'},
            MEDIA_TYPES: ['audio', 'image'],
            MESSAGE: {
                GENERATED_BY_BOT: 'bot',
                GENERATED_BY_USER: 'user'
            }
        },
        MAX_SOCKET_MEDIA_SIZE: '1e8', // 100MB
        EMAIL_DELIVERY_STATUS: {
            PENDING: 'pending',
            DELIVERED: 'delivered',
            FAILED: 'failed'
        },
        GENERATED_LINK_REASON: {
            FORGOT_PASSWORD: 'forgot-password',
            EMAIL_VERIFICATION: 'email-verification',
            SHARE_THREAD: 'share-thread'
        },
        SUBSCRIPTIONS: {
            PREMIUM: {
                BILLING_CYCLE: {
                    MONTHLY: {
                        PRICE: 750
                    },
                    YEARLY: {
                        PRICE: 5000
                    }
                },
                FEATURES: [
                    {
                        name: 'Text-to-Voice',
                        description: 'Convert written text into high-quality synthesized speech',
                    },
                    {
                        name: 'Voice-to-Text',
                        description: 'Transcribe spoken words or audio content into written text',
                    },
                    {
                        name: 'Voice-to-Voice',
                        description: 'Translate and convert spoken words from one language to another'
                    }
                    
                ],
            },
            FREEMIUM: {
                FEATURES: [
                    {
                        name: 'Text-to-Text',
                        description: 'Get response to written text in text form.'
                    }
                ]
            }
        }, 
    },

    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,

    ORGANISATION_EMAIL_ADDRESS: process.env.ORGANISATION_EMAIL_ADDRESS,
    ORGANISATION_EMAIL_PASSWORD: process.env.ORGANISATION_EMAIL_PASSWORD,
    ORGANISATION_MAIL_HOST: process.env.ORGANISATION_MAIL_HOST
}