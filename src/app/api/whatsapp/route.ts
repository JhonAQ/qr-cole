import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, templateName, parameters } = await request.json();

    // Formato simple del número (remover + si existe)
    const phoneNumber = to.startsWith('+') ? to.slice(1) : to;

    const whatsappData = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "es"
        },
        components: [
          {
            type: "body",
            parameters: parameters.map((param: string) => ({
              type: "text",
              text: param
            }))
          }
        ]
      }
    };

    const response = await fetch(
      process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v22.0/718835381317633/messages',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whatsappData)
      }
    );

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, data: result });
    } else {
      console.error('WhatsApp API error:', result);
      return NextResponse.json({ success: false, error: result }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error in WhatsApp API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
