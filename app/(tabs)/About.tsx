import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native';

const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View
    style={[
      {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      },
      style,
    ]}
  >
    {children}
  </View>
);

const SectionCard = ({ 
  title, 
  children, 
  icon, 
  iconColor = '#2563EB' 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon?: string;
  iconColor?: string;
}) => (
  <Card style={{ padding: 20, marginTop: 16 }}>
    {icon && (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <Text style={{ fontWeight: '900', color: '#0F172A', fontSize: 20, marginLeft: 10 }}>
          {title}
        </Text>
      </View>
    )}
    {!icon && (
      <Text style={{ fontWeight: '900', color: '#0F172A', fontSize: 20, marginBottom: 12 }}>
        {title}
      </Text>
    )}
    {children}
  </Card>
);

const CommitmentItem = ({ icon, text, color }: { icon: string; text: string; color: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
    <View style={{ 
      width: 40, 
      height: 40, 
      borderRadius: 20, 
      backgroundColor: `${color}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      marginTop: 2
    }}>
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <Text style={{ flex: 1, color: '#374151', lineHeight: 22, fontSize: 15 }}>
      {text}
    </Text>
  </View>
);

export default function About() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7FB' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* HERO SECTION */}
        <Card>
          <LinearGradient
            colors={['#1e293b', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 24,
              overflow: 'hidden',
            }}
          >
            <Text style={{ color: '#A5F3FC', fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              About Us
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontWeight: '900',
                fontSize: 32,
                marginTop: 8,
                lineHeight: 40,
              }}
            >
              ARVIT HEALTHTECH PRIVATE LIMITED
            </Text>
            <Text style={{ color: '#E0F2FE', marginTop: 12, lineHeight: 22, fontSize: 16 }}>
              Empowering communication and development through innovative health technology
            </Text>
            <View style={{ height: 4, backgroundColor: '#38bdf8', borderRadius: 999, marginTop: 20, opacity: 0.75 }} />
          </LinearGradient>
        </Card>

        {/* COMPANY OVERVIEW */}
        <SectionCard title="Who We Are" icon="business-outline" iconColor="#2563EB">
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15 }}>
            ARVIT HEALTHTECH PRIVATE LIMITED is a trusted destination for child development and therapy. We are dedicated to transforming young lives through science-backed, structured, and compassionate therapies. Our mission is to help every child reach their full potential through early intervention, expert therapies, and active parental involvement.
          </Text>
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15, marginTop: 12 }}>
            We stand as a beacon for those seeking the best in autism therapy, speech therapy, ADHD management, and holistic developmental support. In addition to our clinical services, we also provide a web-based Augmentative and Alternative Communication (AAC) platform to support individuals with communication and developmental challenges.
          </Text>
        </SectionCard>

        {/* OUR MISSION */}
        <SectionCard title="Our Mission" icon="flag-outline" iconColor="#10B981">
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15, marginBottom: 16 }}>
            ARVIT HEALTHTECH PRIVATE LIMITED – A Trusted Destination for Child Development and Therapy
          </Text>
          
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15, marginBottom: 16 }}>
            At ARVIT HEALTHTECH PRIVATE LIMITED, we're more than just a clinic — we're a movement dedicated to transforming young lives. Our journey began with a simple observation: families were struggling to find consistent, quality support for children with autism, speech delays, ADHD, and other developmental challenges. Many parents went from one specialist to another, often receiving incomplete or uncoordinated care. We knew there had to be a better way.
          </Text>

          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15, marginBottom: 16 }}>
            Driven by a mission to offer science-backed, structured, and compassionate therapies under one roof, we established our first child development center. Our goal was clear — to help every child reach their full potential through early intervention, expert therapies, and active parental involvement.
          </Text>

          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15, marginBottom: 16 }}>
            In the beginning, we served just a few families. But soon, stories of progress began to spread — children who once struggled to speak were saying their first words, kids with poor attention spans were now learning with joy. As hope replaced uncertainty, more families began turning to us for trusted guidance and care.
          </Text>

          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15 }}>
            Today, ARVIT HEALTHTECH PRIVATE LIMITED stands as a beacon for those seeking the best in autism therapy, speech therapy, ADHD management, and holistic developmental support.
          </Text>
        </SectionCard>

        {/* CORE FUNCTIONALITY */}
        <SectionCard title="Our Platform" icon="grid-outline" iconColor="#10B981">
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15, marginBottom: 12 }}>
            The core functionality of our platform is a <Text style={{ fontWeight: '700', color: '#0F172A' }}>Grid-Based AAC Communication System</Text>, which allows users with limited or no verbal speech to communicate using structured grids of symbols, images, and text.
          </Text>
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15 }}>
            These grids support everyday communication such as expressing needs, choices, emotions, and daily activities in a clear and accessible manner.
          </Text>
        </SectionCard>

        {/* THERAPY SUPPORT */}
        <SectionCard title="Therapy Support Features" icon="medical-outline" iconColor="#8B5CF6">
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15, marginBottom: 16 }}>
            In addition to AAC grids, the platform includes digital therapy-support features aligned with commonly used practices in:
          </Text>
          
          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 18, 
                backgroundColor: '#DBEAFE',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="chatbubbles-outline" size={18} color="#2563EB" />
              </View>
              <Text style={{ color: '#374151', fontSize: 16, fontWeight: '600' }}>
                Speech Therapy
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 18, 
                backgroundColor: '#D1FAE5',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="hand-left-outline" size={18} color="#10B981" />
              </View>
              <Text style={{ color: '#374151', fontSize: 16, fontWeight: '600' }}>
                Occupational Therapy (OT)
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 18, 
                backgroundColor: '#E9D5FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="people-outline" size={18} color="#8B5CF6" />
              </View>
              <Text style={{ color: '#374151', fontSize: 16, fontWeight: '600' }}>
                Behavioral Therapy (BT)
              </Text>
            </View>
          </View>

          <Text style={{ color: '#6B7280', lineHeight: 22, fontSize: 14, marginTop: 12, fontStyle: 'italic' }}>
            These features are designed to support communication and functional development goals and are intended to complement professional therapy services.
          </Text>
        </SectionCard>

        {/* TARGET AUDIENCE */}
        <SectionCard title="Who We Serve" icon="people-circle-outline" iconColor="#F59E0B">
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15 }}>
            The platform is suitable for children and adults with autism spectrum disorder, speech and language delays, developmental challenges, and other neurodiverse conditions, as well as for caregivers, therapists, and educators supporting them.
          </Text>
        </SectionCard>

        {/* DISCLAIMER */}
        <Card style={{ padding: 20, marginTop: 16, backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="information-circle" size={24} color="#D97706" style={{ marginRight: 12, marginTop: 2 }} />
            <Text style={{ flex: 1, color: '#92400E', lineHeight: 22, fontSize: 14, fontWeight: '600' }}>
              This platform provides digital communication and therapy-support tools only and does not offer medical diagnosis, prescription, or clinical treatment.
            </Text>
          </View>
        </Card>

        {/* LEGAL INFORMATION */}
        <SectionCard title="Legal & Corporate Information" icon="document-text-outline" iconColor="#EF4444">
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15, marginBottom: 12 }}>
            I hereby certify that ARVIT HEALTHTECH PRIVATE LIMITED is incorporated on the Twentieth day of October, Two Thousand Twenty-Three, under the Companies Act, 2013 (18 of 2013), and that the company is a Company Limited by Shares.
          </Text>
        </SectionCard>

        {/* REGISTERED ADDRESS */}
        <SectionCard title="Registered Address" icon="location-outline" iconColor="#EC4899">
          <Text style={{ color: '#374151', lineHeight: 24, fontSize: 15 }}>
            As issued by the Income Tax Department:
          </Text>
          <View style={{ 
            marginTop: 12, 
            padding: 16, 
            backgroundColor: '#F9FAFB', 
            borderRadius: 12,
            borderLeftWidth: 3,
            borderLeftColor: '#EC4899'
          }}>
            <Text style={{ color: '#111827', lineHeight: 24, fontSize: 15, fontWeight: '600' }}>
              146, St. No. 3, Bawa Colony,{'\n'}
              Haibowal Kalan, Durgapuri,{'\n'}
              Ludhiana – 141001,{'\n'}
              Punjab, India
            </Text>
          </View>
        </SectionCard>

        {/* OUR COMMITMENT */}
        <SectionCard title="Our Commitment" icon="heart-outline" iconColor="#F43F5E">
          <CommitmentItem 
            icon="shield-checkmark-outline" 
            text="Ethical use of digital health technology" 
            color="#10B981" 
          />
          <CommitmentItem 
            icon="lock-closed-outline" 
            text="User data privacy and confidentiality" 
            color="#2563EB" 
          />
          <CommitmentItem 
            icon="people-outline" 
            text="Responsible design for children and vulnerable users" 
            color="#8B5CF6" 
          />
          <CommitmentItem 
            icon="checkmark-circle-outline" 
            text="Transparent and lawful business operations" 
            color="#F59E0B" 
          />
        </SectionCard>

        {/* FOOTER SPACING */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

