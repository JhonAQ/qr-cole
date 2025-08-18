import axios from 'axios';

interface WhatsAppTemplateParams {
  NOMBRE: string;
  TYPE: string;
  TIME: string;
  LUGAR: string;
}

export const sendWhatsAppTemplate = async (
  phoneNumber: string,
  params: WhatsAppTemplateParams
) => {
  try {
    const response = await axios.post('/api/whatsapp', {
      phoneNumber,
      params
    });

    return response.data;
  } catch (error: any) {
    console.error('Error sending WhatsApp template:', error);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
};
      success: false, 
      error: error.message 
    };
  }
};
                  type: "text",
                  text: params.NOMBRE
                },
                {
                  type: "text", 
                  text: params.TYPE
                },
                {
                  type: "text",
                  text: params.TIME
                },
                {
                  type: "text",
                  text: params.LUGAR
                }
              ]
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error sending WhatsApp template:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
};
