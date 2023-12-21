import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, RadioGroup, Radio } from "@nextui-org/react";

export default function SkillModal({ isOpen, onOpenChange, topic, labels }) {

  const skill_labels = labels.profile_lists[topic.api_url];

	return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <form id="skill-modal" onSubmit={event => {topic.addSkill(event);onClose()}}>
              <ModalHeader className="flex flex-col gap-1">{topic.add_title}</ModalHeader>
              <ModalBody>
              	<Input name={topic.primary} id={topic.primary} type="text"
                        className="border-none pb-6"
                        label={skill_labels.primary_label}
                        labelPlacement='outside'
                        variant='bordered'
                        required
                    />
                {topic.is_link ?
	              	<Input name={topic.secondary} id={topic.secondary} type="url"
	                        className="border-none pb-6"
	                        label={skill_labels.secondary_label}
	                        labelPlacement='outside'
	                        variant='bordered'
	                        required
	                    />
	                :
	                <RadioGroup name={topic.secondary} id={topic.secondary} label={skill_labels.secondary_label}>
	                	{topic.options.map(option => (
	                		<Radio key={`link-option-${option}`} value={option}> {skill_labels.options[option]} </Radio>
	                	))}
	                </RadioGroup>
	            }
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {labels.UI.cancel}
                </Button>
                <Button color="primary" type="submit">
                  {labels.UI.add}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
	);
}