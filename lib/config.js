function required(name){
    const value = process.env[name];
    if(!value){
        throw new Error(`Missing environment variable: ${name}`);

    }
    return value;

}

export function loadConfig(){
    return {
        webhookUser: required('WEBHOOK_USER'),
        webhookPassword: required('WEBHOOK_PASSWORD'),
        groqApiKey: required('GROQ_API_KEY'),
        groqModel: process.env.GROQ_MODEL,
        slackWebhookUrl: required('SLACK_WEBHOOK_URL')



    };
}